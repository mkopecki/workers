use actix_web::{ error::ErrorInternalServerError, get, middleware, post, web, App, HttpResponse, HttpServer, Responder };
use diesel::{ prelude::*, r2d2 };
use tokio::sync::mpsc;

mod actions;
mod models;
mod schema;
mod runner;

type DbPool = r2d2::Pool<r2d2::ConnectionManager<SqliteConnection>>;

#[post("/run")]
async fn create_run(pool: web::Data<DbPool>, job_tx: web::Data<mpsc::Sender<String>>) -> actix_web::Result<impl Responder> {
    println!("test a");
    let run = web::block(move || {
        let mut conn = pool.get()?;
        actions::insert_new_run(&mut conn)
    })
    .await?
    .map_err(ErrorInternalServerError)?;

    job_tx.send(run.id.clone())
      .await
      .map_err(|e| {
         actix_web::error::ErrorInternalServerError("Job queue closed")
      })?;

    Ok(HttpResponse::Created().json(run))
}

#[get("/run/{run_id}")]
async fn get_run(pool: web::Data<DbPool>, run_id: web::Path<String>) -> actix_web::Result<impl Responder> {
    println!("test b");
    let run_id = run_id.into_inner();

    let run = web::block(move || {
        let mut conn = pool.get()?; 
        actions::find_run_by_id(&mut conn, run_id)
    })
    .await?
    .map_err(ErrorInternalServerError)?;
    
    Ok(match run {
        Some(run) => HttpResponse::Ok().json(run),
        None => HttpResponse::NotFound().body("run not found"),
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    let pool = initialize_db_pool();

    log::info!("starting HTTP server at http://localhost:8080");

        // capacity = how many queued jobs you can buffer
    let (job_tx, mut job_rx) = mpsc::channel::<String>(128);

    let pool_bg = pool.clone();
    tokio::spawn(async move {
        while let Some(run_id) = job_rx.recv().await {
            let pool_job = pool_bg.clone();
            tokio::spawn(async move {
                // claim it
                let mut conn = pool_job.get().unwrap();
                diesel::update(crate::schema::run::dsl::run.filter(crate::schema::run::dsl::id.eq(&run_id)))
                   .set(crate::schema::run::dsl::status.eq("processing"))
                   .execute(&mut conn)
                   .unwrap();

                // do your work…
                if let Err(e) = runner::process_run(run_id.clone()).await {
                    eprintln!("run {} failed: {}", run_id, e);
                    // mark failed
                    let mut conn = pool_job.get().unwrap();
                    diesel::update(crate::schema::run::dsl::run.filter(crate::schema::run::dsl::id.eq(&run_id)))
                       .set(crate::schema::run::dsl::status.eq("failure"))
                       .execute(&mut conn)
                       .unwrap();
                } else {
                    // mark done
                    let mut conn = pool_job.get().unwrap();
                    diesel::update(crate::schema::run::dsl::run.filter(crate::schema::run::dsl::id.eq(&run_id)))
                       .set(crate::schema::run::dsl::status.eq("success"))
                       .execute(&mut conn)
                       .unwrap();
                }
            });
        }
    });

    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(job_tx.clone()))
            .service(create_run)
            .service(get_run)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

fn initialize_db_pool() -> DbPool {
    let conn_spec = std::env::var("DATABASE_URL").expect("DATABASE_URL should be set");
    let manager = r2d2::ConnectionManager::<SqliteConnection>::new(conn_spec);
    r2d2::Pool::builder()
        .build(manager)
        .expect("database URL should be valid path to SQLite DB file")
}

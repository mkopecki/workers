use actix_web::{ error::ErrorInternalServerError, get, middleware, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder };
use diesel::{ prelude::*, r2d2 };
use uuid::Uuid;

mod actions;
mod models;

type DbPool = r2d2::Pool<r2d2::ConnectionManager<SqliteConnection>>;

#[post("/run")]
async fn create_run(pool: web::Data<DbPool>, form: web::Json<models::NewRun>) -> actix_web::Result<impl Responder> {

    let run = web::block(move || {
        let mut conn = pool.get();
        actions::insert_new_run(&mut conn);
    });


    Ok(NamedFile::open("static/favicon.ico")?)
}

#[get("/run/{run_id}")]
async fn get_run(pool: web::Data<DbPool>, run_id: web::Path<Uuid>) -> actix_web::Result<impl Responder> {
    let run_id = run_id.into_inner();

    let run = web::block(move || {
        let mut conn = pool.get()?; 
        actions::find_run_by_id(&mut conn, run_id)
    })
    .await?
    .map_err(ErrorInternalServerError)?;
    
    Ok(match run {
        Some(run) => HttpResponse::Ok().json(run),
        None => HttpResponse::NotFound().body(format!("No run found with UID: {run_id}")),
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = initialize_db_pool();

    log::info!("starting HTTP server at http://localhost:8080");

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(pool.clone()))
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


// create run
// get run

use diesel::prelude::*;
use uuid::Uuid;

use crate::models;

type DbError = Box<dyn std::error::Error + Send + Sync>;

/// Run query using Diesel to find user by uid and return it.
pub fn find_run_by_id(
    conn: &mut SqliteConnection,
    uid: Uuid,
) -> Result<Option<models::Run>, DbError> {
    use crate::schema::users::dsl::*;

    let user = users
        .filter(id.eq(uid.to_string()))
        .first::<models::User>(conn)
        .optional()?;

    Ok(user)
}

/// Run query using Diesel to insert a new database row and return the result.
pub fn insert_new_run(
    conn: &mut SqliteConnection,
) -> Result<models::Run, DbError> {
    // It is common when using Diesel with Actix Web to import schema-related
    // modules inside a function's scope (rather than the normal module's scope)
    // to prevent import collisions and namespace pollution.
    use crate::schema::runs::dsl::*;

    let new_run = models::Run {
        id: Uuid::new_v4().to_string(),
        status: "queued".into(),
    };

    diesel::insert_into(run).values(&new_user).execute(conn)?;

    Ok(new_run)
}

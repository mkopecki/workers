use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::run)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Run {
    pub id: i32,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewRun {
    pub status: String,
}

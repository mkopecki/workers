use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Deserialize, Insertable, Debug)]
#[diesel(table_name = crate::schema::run)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Run {
    pub id: String,
    pub status: String,
}

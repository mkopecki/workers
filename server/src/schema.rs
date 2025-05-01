// @generated automatically by Diesel CLI.

diesel::table! {
    run (id) {
        id -> Nullable<Integer>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        status -> Text,
    }
}

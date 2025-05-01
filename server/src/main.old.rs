use std::{fs, fs::File};

use cuid;

use containerd_client::{
    connect,
    services::v1::{
        containers_client::ContainersClient,
        tasks_client::TasksClient,
        version_client::VersionClient,
        snapshots::snapshots_client::SnapshotsClient, 
        images_client::ImagesClient,
        snapshots::PrepareSnapshotRequest,
        container::Runtime,
        GetImageRequest,
        Container,
        WaitRequest,
        CreateTaskRequest,
        StartRequest,
        CreateContainerRequest,
        DeleteTaskRequest,
        DeleteContainerRequest
    },
    with_namespace,
    tonic::Request
};
use anyhow::Result;
use prost_types::Any;

const NAMESPACE: &str = "default";

#[tokio::main]
async fn main() -> Result<()> {
    let addr = "/Users/maximkopecki/.containerd-user.sock";
    let channel = connect(addr).await?;

    let mut c_vers = VersionClient::new(channel.clone());
    let resp = c_vers.version(()).await?;
    println!("Response: {:?}", resp.get_ref());

    let cid = cuid::cuid2();

    // let mut images = ImagesClient::new(channel.clone());
    // let req = GetImageRequest {
    //     name: "docker.io/library/alpine:latest".into(),
    //     ..Default::default()
    // };
    // let req = with_namespace!(req, NAMESPACE);
    // let resp = images.get(req).await?;
    // let image = resp.into_inner().image
    //     .expect("image should be present");
    // println!("Image config descriptor: {:?}", image.target);
    //
    // // 1. choose a snapshot key and snapshotter
    // let snapshot_key = format!("{cid}-snap");
    // let snapshotter   = "overlayfs";         // rootless: "fuse-overlayfs" also works
    //
    // // 2. prepare a *view* snapshot from the image’s chainID
    // let mut snaps = SnapshotsClient::new(channel.clone());
    // let parent = image.target.unwrap().digest;          // chainID digest
    // let req = PrepareSnapshotRequest {
    //     snapshotter: snapshotter.into(),
    //     key:    snapshot_key.clone(),
    //     parent,               // ← link layers → snapshot
    //     ..Default::default()
    // };
    // println!("req: {:?}", req);
    // let req = with_namespace!(req, NAMESPACE);
    // snaps.prepare(req).await?;

    let mut c_cont = ContainersClient::new(channel.clone());
    let mut c_task = TasksClient::new(channel.clone());

    let rootfs = "rootfs";
    let output = "hello rust client";

    let spec = include_str!("container_spec.json");
    let spec = spec
        .to_string()
        .replace("$ROOTFS", rootfs)
        .replace("$OUTPUT", output);

    let spec = Any {
        type_url: "types.containerd.io/opencontainers/runtime-spec/1/Spec".to_string(),
        value: spec.into_bytes(),
    };

    let container = Container {
        id: cid.to_string(),
        image: "docker.io/library/alpine:latest".to_string(),
        // image: "localhost/mybase".to_string(),
        runtime: Some(Runtime {
            name: "io.containerd.runc.v2".to_string(),
            options: None,
        }),
        spec: Some(spec),
        // snapshotter: snapshotter.into(),
        // snapshot_key: snapshot_key.clone(),
        ..Default::default()
    };

    let req = CreateContainerRequest {
        container: Some(container),
    };
    let req = with_namespace!(req, NAMESPACE);
    c_cont.create(req).await?;

    println!("Container: {:?} created", cid);

    let tmp = std::env::temp_dir().join("containerd-client-test");
    fs::create_dir_all(&tmp).expect("Failed to create temp directory");
    let stdin = tmp.join("stdin");
    let stdout = tmp.join("stdout");
    let stderr = tmp.join("stderr");
    File::create(&stdin).expect("Failed to create stdin");
    File::create(&stdout).expect("Failed to create stdout");
    File::create(&stderr).expect("Failed to create stderr");

    let req = CreateTaskRequest {
        container_id: cid.to_string(),
        stdin: stdin.to_str().unwrap().to_string(),
        stdout: stdout.to_str().unwrap().to_string(),
        stderr: stderr.to_str().unwrap().to_string(),
        ..Default::default()
    };
    let req = with_namespace!(req, NAMESPACE);
    c_task.create(req).await?;
    println!("Task: {:?} created", cid);

    let req = StartRequest {
        container_id: cid.to_string(),
        ..Default::default()
    };
    let req = with_namespace!(req, NAMESPACE);
    c_task.start(req).await?;
    println!("Task: {:?} started", cid);

    let req = WaitRequest {
        container_id: cid.to_string(),
        ..Default::default()
    };
    let req = with_namespace!(req, NAMESPACE);
    c_task.wait(req).await?;

     println!("Task: {:?} stopped", cid);

    // delete task
    let req = DeleteTaskRequest {
        container_id: cid.to_string(),
    };
    let req = with_namespace!(req, NAMESPACE);

    let _resp = c_task.delete(req).await.expect("Failed to delete task");

    println!("Task: {:?} deleted", cid);

    let req = DeleteContainerRequest {
        id: cid.to_string(),
    };
    let req = with_namespace!(req, NAMESPACE);

    let _resp = c_cont
        .delete(req)
        .await
        .expect("Failed to delete container");

    println!("Container: {:?} deleted", cid);

    // test container output
    let actual_stdout = fs::read_to_string(stdout).expect("read stdout actual");
    assert_eq!(actual_stdout.strip_suffix('\n').unwrap(), output);

    // clear stdin/stdout/stderr
    let _ = fs::remove_dir_all(tmp);

    Ok(())
}

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
        DeleteContainerRequest,
        ReadContentRequest,
        content_client::ContentClient,
    },
    with_namespace,
    tonic::Request
};
use oci_spec::runtime::{SpecBuilder, ProcessBuilder, RootBuilder, MountBuilder, LinuxBuilder};
use oci_spec::image::ImageConfiguration;
use prost_types::Any;
use serde_json;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 0. Dial containerd
    let addr = "/Users/maximkopecki/.containerd-user.sock";
    let channel = connect(addr).await?;
    let ns = "default";                      // or "k8s.io", etc.
    let mut images = ImagesClient::new(channel.clone());
    let mut snaps  = SnapshotsClient::new(channel.clone());
    let cnts   = ContainersClient::new(channel.clone());
    let content = ContentClient::new(channel.clone());

    // 1. Resolve (or pull) the image
    let image_ref = "docker.io/library/alpine:latest";
    let req = GetImageRequest {
        name: image_ref.to_string(),
        ..Default::default()
    };
    let req = with_namespace!(req, ns);
    let resp = images.get(req).await?;
    let img = resp.into_inner().image
        .expect("image should be present");
    println!("Image config descriptor: {:?}", img.target);

    println!("img {:?}", img);

    // 2. Create a writable snapshot for this container
    let snapshotter   = "overlayfs";         // rootless: "fuse-overlayfs" also works
    let snap_key = "alpine-snap-123";
    let parent = img.target.unwrap().digest;

    let req = PrepareSnapshotRequest {
        snapshotter: snapshotter.into(),
        key:    snap_key.into(),
        parent: parent.clone(),
        ..Default::default()
    };
    println!("req: {:?}", req);
    let req = with_namespace!(req, ns);
    snaps.prepare(req).await?;

    // 3. Fetch & parse the image *config* blob
    let cfg_desc = img.target.unwrap().digest;
    let req = ReadContentRequest {
        digest: cfg_desc.clone(),
        ..Default::default()
    };
    let req = with_namespace!(req, ns);
    let cfg_bytes = content.read(req).await?.into_inner().data;

    // let cfg: ImageConfiguration = serde_json::from_slice(&cfg_bytes)?;
    //
    // // 4. Build the OCI **runtime** spec
    // let proc = ProcessBuilder::default()
    //     .args(cfg.entrypoint().iter().chain(cfg.cmd()).cloned().collect::<Vec<_>>())
    //     .env(cfg.env().clone())
    //     .cwd(cfg.working_dir().clone().unwrap_or_else(|| "/".into()))
    //     .no_new_privileges(true)
    //     .build()?;
    //
    // let spec = SpecBuilder::default()
    //     .oci_version("1.0.2")           // any v1.x is fine
    //     .process(proc)
    //     .root(RootBuilder::default().path(snap_key).readonly(false).build()?)
    //     .mount(MountBuilder::default().destination("/proc").r#type("proc").source("proc").build()?)
    //     .linux(LinuxBuilder::default().build()?)
    //     .build()?;
    //
    // // 5. Pack into protobuf Any
    // let any_spec = Any {
    //     type_url: "types.containerd.io/opencontainers/runtime-spec/1.0".into(),
    //     value: serde_json::to_vec(&spec)?,
    // };
    //
    // // 6. Create the container
    // let req = CreateContainerRequest {
    //     container: Some(Container {
    //         id: "busybox1".into(),
    //         image: img.name.clone(),
    //         runtime: Some(Runtime {
    //             name: "io.containerd.runc.v2".into(),
    //             options: None,
    //         }),
    //         spec: Some(any_spec),
    //         snapshotter: "overlayfs".into(),
    //         snapshot_key: snap_key.into(),
    //         ..Default::default()
    //     }),
    // };
    // with_namespace(ns, cnts.create(req)).await?;
    Ok(())
}


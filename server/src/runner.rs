use bollard::container::Config;
use bollard::container::{CreateContainerOptions, StartContainerOptions, LogsOptions};
use bollard::{Docker, API_DEFAULT_VERSION};

use futures_util::stream::StreamExt;
use anyhow::Result;

const IMAGE: &str = "test_worker:local";

pub async fn process_run(run_id: String) -> Result<()> {
    let docker = Docker::connect_with_socket("/Users/maximkopecki/.colima/default/docker.sock", 120, API_DEFAULT_VERSION).unwrap();


    let container_config = Config {
        image: Some(String::from(IMAGE)),
        tty: Some(true),
        attach_stdout: Some(true),
        attach_stderr: Some(true),
        cmd: Some(vec![run_id]),
        ..Default::default()
    };

    let id = docker
        .create_container(
            None::<CreateContainerOptions<String>>,
            container_config,
        )
        .await?
        .id;

    println!("created container {id}");

    docker
        .start_container(
            &id,
            None::<StartContainerOptions<String>>,
        )
        .await?;

    println!("started container {id}");

    let mut log_stream = docker.logs(
        &id,
        Some(LogsOptions {
            follow: true,
            stdout: true,
            stderr: true,
            tail: "all",
            ..Default::default()
        }),
    );
    println!("attached logs from container {id}");

    while let Some(frame) = log_stream.next().await {
        match frame {
            Ok(val)   => print!("{val}"),
            Err(err)  => eprintln!("Error occurred: {}", err),
        }

        // match frame {
        //     Ok(LogOutput::StdOut { message }) => {
        //         println!("stdout");
        //         print!("{}", String::from_utf8_lossy(&message));
        //     }
        //     Ok(LogOutput::StdErr { message }) => {
        //         println!("stderr");
        //         eprint!("{}", String::from_utf8_lossy(&message));
        //     }
        //     Err(e) => {
        //         eprintln!("error streaming logs: {}", e);
        //         break;
        //     }
        //     _ => {}
        // }
    }


    // unsafe {
    //     let exec = docker
    //         .create_exec(
    //             &id,
    //             CreateExecOptions {
    //                 attach_stdout: Some(true),
    //                 attach_stderr: Some(true),
    //                 cmd: Some(
    //                     vec!["ls", "/"]
    //                 ),
    //                 ..Default::default()
    //             },
    //         )
    //         .await?
    //         .id;
    //
    //     println!("created exec: {exec}");
    //
    //     let result = docker.start_exec(&exec, None).await?;
    //     if let StartExecResults::Attached {mut output, ..} = result {
    //         while let Some(Ok(msg)) = output.next().await {
    //             print!("{msg}");
    //         }
    //     }
    // }

    // docker
    //     .remove_container(
    //         &id,
    //         RemoveContainerOptions {
    //             force: true,
    //             ..Default::default()
    //         }
    //     .await?;
    Ok(())
}

import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "alderaan08.umbler.host",
            user: "clubeaquitem-com-br",
            password: process.env.FTP_PASSWORD,
            port: 21,
            secure: false
        });
        await client.uploadFrom('test-node.php', 'public/test-node.php');
        await client.uploadFrom('test-node.php', 'test-node.php');
        console.log("Uploaded test-node.php");
    } catch (e) { console.error(e) }
    client.close();
}
run();

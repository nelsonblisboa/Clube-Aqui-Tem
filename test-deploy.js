import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

async function testDeploy() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "alderaan08.umbler.host",
            user: "clubeaquitem-com-br",
            password: process.env.FTP_PASSWORD,
            port: 21,
            secure: false
        });

        await client.uploadFrom('bare-server.js', 'app.js');
        await client.uploadFrom('bare-server.js', 'server.js');
        await client.uploadFrom('bare-server.js', 'bootstrap.js');
        await client.uploadFrom('bare-server.js', 'public/app.js');
        await client.uploadFrom('bare-server.js', 'public/server.js');
        await client.uploadFrom('bare-server.js', 'public/bootstrap.js');

        await client.ensureDir("tmp");
        const fs = await import('fs');
        fs.writeFileSync('restart.txt', Date.now().toString());
        await client.uploadFrom('restart.txt', 'tmp/restart.txt');

        console.log("Bare server uploaded. Let's see if Passenger starts it.");
    } catch (e) {
        console.error(e);
    }
    client.close();
}
testDeploy();

const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const sdk = require('./sdk');


const archive = archiver('zip');

const zip_theme = async (build_name, build_path) => {

    let zipfile_path=  path.resolve(build_path, `${build_name}.zip`);
    console.log(zipfile_path);

    const output = fs.createWriteStream(zipfile_path);

    output.on('finish', function() {

        if (archive.pointer() >= sdk.MAX_ZIP_FILE_SIZE_50MB) {
            fs.rmSync(zipfile_path)
            console.log('Total size: '+archive.pointer());
            console.error(`${build_name}.zip has to be less than 50MB`)
        }

        console.log('Total size: '+archive.pointer());
        console.log(`${build_name}.zip successfully created 🎉!\n`);

    });

    archive.pipe(output);

    sdk.root_allowed_files.forEach(file => {

        let file_path = path.resolve(build_path, file)

        if (fs.existsSync(file_path)) { 
            archive.append(fs.createReadStream(file_path), { name: file });
        }
        
    })

    for (let folder in sdk.structure) {

        let folder_path = path.resolve(build_path, folder)

        if (folder !== 'root' && fs.existsSync(folder_path)) {

            let files = fs.readdirSync(folder_path)

            archive.append('', { name: `${folder}/` });

            files.forEach(file => {
                let file_path = path.resolve(build_path, folder, file)
                archive.append(fs.createReadStream(file_path), { name: `${folder}/${file}` });
            })
        }

    }

    await archive.finalize();
}

zip_theme('landing-page','');


module.exports = zip_theme;
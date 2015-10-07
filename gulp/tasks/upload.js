import {join} from 'path';

export default function(gulp, plugins, config) {
  const {s3Upload, gutil} = plugins;
  const {utils, environment, sources} = config;
  const {getTaskName, addbase} = utils;
  const {branch, isDevRoot, isMaster} = environment;
  const {buckets, buildDir} = sources;

  return () => {
    const task = getTaskName(gulp.currentTask);
    let src;

    if (task === 'assets') {
      src = addbase(buildDir, '{img,js,css,icons,fonts}/**/*');
    } else if (task === 'html') {
      src = addbase(buildDir, '**/*.html');
    }

    const {
      AWS_BUCKET_REGION,
      AWS_ACCESS_KEY_ID_DEV,
      AWS_SECRET_ACCESS_KEY_DEV,
      AWS_ACCESS_KEY_ID_PROD,
      AWS_SECRET_ACCESS_KEY_PROD
    } = process.env;
    const aws = {
      config: {
        Bucket: isMaster ? buckets.prod : buckets.dev,
        ACL: 'public-read',
        keyTransform(relativeFilename) {
          let fp;
          if (isDevRoot || isMaster) {
            fp = join(task, relativeFilename);
          } else if (branch) {
            fp = join(task, branch, relativeFilename);
          }
          return fp;
        }
      },
      credentials: {
        region: AWS_BUCKET_REGION || 'us-east-1',
        accessKeyId: isMaster ? AWS_ACCESS_KEY_ID_PROD : AWS_ACCESS_KEY_ID_DEV,
        secretAccessKey: isMaster ? AWS_SECRET_ACCESS_KEY_PROD : AWS_SECRET_ACCESS_KEY_DEV
      }
    };

    const s3 = s3Upload(aws.credentials);

    gutil.log(gutil.colors.magenta(`Uploading ${task} from branch ${branch}`));

    return gulp.src(src)
      .pipe(s3(aws.config));
  };
}

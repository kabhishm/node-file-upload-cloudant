## Node file uploader for Cloudant using Pipes and Streams

This is an example application which can be run on Bluemix.

This application showcases how to pipe files from a multi-part form using streams to Cloudant.  This is really important by using pipes and streams you do not chew up disk space or memory.

### Build status
![Bluemix Deployments](https://deployment-tracker.mybluemix.net/stats/c18028c774d53b033ce21310498c7ba0/badge.svg)

### Deploy this app:

####  Automatically by clicking this image:

[![Deploy to Bluemix](https://deployment-tracker.mybluemix.net/stats/c18028c774d53b033ce21310498c7ba0/button.svg)](https://bluemix.net/deploy?repository=https://github.com/IBM-Bluemix/node-file-upload-cloudant.git)

#### Manually as follows:

1. Clone the app (i.e. this repo)

  ```
  git clone https://github.com/IBM-Bluemix/node-file-upload-cloudant.git
  cd node-file-upload-cloudant
  ```

2. Create a Object Storage service instance specifically for this application.  With Bluemix, the following command will create a free Object Storage instance.

  ```
    cf create-service cloudantNoSQLDB Shared cloudant-node-file-upload
  ```

3. Edit the manifest.yml file.  Change the 'host' attribute to something unique.

4. Push to Bluemix with the updated `manifest.yml`.

  ```
  cf push
  ```


Access your application URL in the browser.  You should see the main page and be able to navigate the links.

### Privacy Notice

The Personality Box sample web application includes code to track deployments to Bluemix and other Cloud Foundry platforms. The following information is sent to a [Deployment Tracker] [deploy_track_url] service on each deployment:

* Application Name (`application_name`)
* Space ID (`space_id`)
* Application Version (`application_version`)
* Application URIs (`application_uris`)

This data is collected from the `VCAP_APPLICATION` environment variable in IBM Bluemix and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Bluemix. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

### Disabling Deployment Tracking

Deployment tracking can be disabled by removing `require("cf-deployment-tracker-client").track();` from the beginning of the `server.js` main server file.

[deploy_track_url]: https://github.com/IBM-Bluemix/cf-deployment-tracker-service

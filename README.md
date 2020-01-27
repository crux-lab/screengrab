# ScreenGrab 
[![Build status](https://ci-tc.cruxlab.net/app/rest/builds/buildType:(id:ScreenGrab_Build)/statusIcon.svg)](https://ci-tc.cruxlab.net/viewType.html?buildTypeId=ScreenGrab_Build&guest=1)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=crux-lab_screengrab&metric=alert_status)](https://sonarcloud.io/dashboard?id=crux-lab_screengrab)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=crux-lab_screengrab&metric=coverage)](https://sonarcloud.io/dashboard?id=crux-lab_screengrab)
[![npm](https://img.shields.io/npm/v/screengrab)](https://www.npmjs.com/package/screengrab)

> ScreenGrab is a command line tool to create multiple website screenshots in bulk.

 It is a wrapper around Puppeteer that allows you to generate screenshots based on a config file. 
 You can define a base url and multiple paths and sizes. The tool will go to each URL, resize the viewport to each 
 defined size and make a full-page screenshot.
 
## Installation
 
 To use ScreenGrab, run:
 
 `npm i -g screengrab`  

It will download Puppeteer and a recent version of Chromium.

## Usage

ScreenGrab requires a config file to be provided:

`screengrab -c config.yaml`

It will read the config file, launch headless Chromium and save screenshots into the current folder 
(it can be overridden in the config file).

## Configuration

Configuration is done via a yaml file. ScreenGrab currently supports the following keys:

```
baseUrl: "http://localhost.com:4000"
paths: #required, list of paths to visit. No need to include leading and trailing / except for the root
    - /
    - objects
    - objects/foo
    - objects/foo/1
sizes:
    width: 640 #required
    height: 480 #optional, default = 800
    density: 2 #optional, default = 1
output: screenshots #optional, path to the folder to save screenshots, default = current dir
batchSize: 3 #optional, indicates number of screenshots done in parallel
```

Note that the `height` parameter is used only to set the browser viewport. ScreenGrab will always make full page screenshots.
Also, the names of the generated files will include the viewport spec, not the actual page size. 

### Parallel execution

The `batchSize` parameter allows to specify number of screenshots done in parallel. 
This effectively sets number of pages open in Chrome.
The default value is 1, which means that all screenshots will be done sequentially. 
Setting this value to -1 will make ScreenGrab take all screenshots in parallel.

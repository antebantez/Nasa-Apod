#!/usr/bin/env node

require("dotenv").config({path: '/home/pi/Nasa-Apod/.env'})

const axios = require("axios")
const Dropbox = require("dropbox")

const apiKey = process.env.API_KEY

const accessToken = process.env.ACCESS_TOKEN

const dbx = new Dropbox.Dropbox({ accessToken })

const getData = () => {
    axios
        .get(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`)
        .then((res) => {
            if (res.data.media_type === "image") {
                const hdURL = res.data.hdurl
                const title = res.data.title
                const dropboxPath = `/${encodeURIComponent(title)}.jpg`

                axios({
                    method: "get",
                    url: hdURL,
                    responseType: "arraybuffer",
                }).then((imgRes) => {
                    dbx.filesUpload({
                        path: dropboxPath,
                        contents: imgRes.data,
                    })
                        .then(() => {
                            console.log(
                                `Image was successfully uploaded to Dropbox: ${title}.jpg`
                            )
                        })
                        .catch((uploadErr) => {
                            console.error(
                                `Error uploading image to Dropbox. Status code: ${uploadErr.status}; Error message: ${uploadErr}`
                            )
                        })
                })
            } else {
                const { title, url } = res.data
                dbx.filesUpload({
                    path: `/${encodeURIComponent(title)}.txt`,
                    contents: Buffer.from(url, "utf-8"),
                })
                    .then(() => {
                        console.log(
                            `File was successfully uploaded to Dropbox: ${title}.txt`
                        )
                    })
                    .catch((uploadErr) => {
                        console.error(
                            `Error uploading file to Dropbox. Status code: ${uploadErr.status}; Error message: ${uploadErr}`
                        )
                    })
            }
        })
        .catch((err) => console.log(err))
}

getData()

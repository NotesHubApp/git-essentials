var spawn = require('child_process').spawn
var fs = require('fs')
var path = require('path')


const dataStr =
`0084want 1e6647a8288ebbebf6a8569d142622ea4ddd5c7c multi_ack_detailed no-done side-band-64k ofs-delta agent=git/isomorphic-git@1.9.4
000ddeepen 1
00000009done`

const data = Buffer.from(dataStr)

axios({
  method: 'post',
  url: 'https://github.com/NotesHubApp/Welcome.git/git-upload-pack',
  data: data,
  responseType: 'arraybuffer',
  headers: {
    'content-type': 'application/x-git-upload-pack-request'
  },
  onDownloadProgress: progressEvent => {
    const dataChunk = progressEvent.currentTarget.response;
    console.log("!!!!")
    // dataChunk contains the data that have been obtained so far (the whole data so far)..
    // So here we do whatever we want with this partial data..
    // In my case I'm storing that on a redux store that is used to
    // render a table, so now, table rows are rendered as soon as
    // they are obtained from the endpoint.
 }
}).then(res => {
    console.log(`statusCode: ${res.status}`);
    console.log(res)
  })
  .catch(error => {
    console.error(error);
  });

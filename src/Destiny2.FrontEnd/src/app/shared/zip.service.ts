import { Injectable } from '@angular/core';

declare let zip;

@Injectable()
export class ZipService {

  constructor() { 
    zip.workerScriptsPath = "/assets/lib/zipjs/";
  }

  public getDatabaseBlob(archiveBlob: Blob): Promise<Uint8Array> {
    return new Promise((res, rej) => {
      zip.createReader(new zip.BlobReader(archiveBlob), function (reader) {
        reader.getEntries(function (entries) {
          if (entries.length) {
            entries[0].getData(new zip.BlobWriter(), (blob) => {
              const blobReader = new FileReader();
              blobReader.addEventListener("load", () => {
                reader.close(() => {
                  var arrayBuffer = blobReader.result;
                  res(new Uint8Array(arrayBuffer));
                })
              })
              blobReader.readAsArrayBuffer(blob);
            })
          }
          else rej("no files found in zip archive");
        });
      });
    });
  }
}
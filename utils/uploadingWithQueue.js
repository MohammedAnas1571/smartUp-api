class UploadQueue {
  constructor() {
    this.queue = [];
    this.uploading = false;
    this.onCompleteCallback = null;
  }

  enqueue(uploadTask) {
    this.queue.push(uploadTask);
    if (!this.uploading) {
      this.uploadNext();
    }
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
  }

  async uploadNext() {
    if (this.queue.length === 0) {
      this.uploading = false;
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
      return;
    }

    this.uploading = true;
    const nextUploadTask = this.queue.shift();

    try {
      const course = await nextUploadTask(); 
      console.log("Upload successful:", course);
    } catch (error) {
      console.error("Error uploading:", error);
    }

    this.uploadNext();
  }
}

export const uploadQueue = new UploadQueue();
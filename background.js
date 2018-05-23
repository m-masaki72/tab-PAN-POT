class myTabCapture{
   constructor(tab){
      chrome.browserAction.setBadgeText({text: "ON"});
      this.init(tab);
   }
   destructor(){
            chrome.browserAction.setBadgeText({text: ""});
      this.clear();
   }

   init(tab){
      this.clear();
      this.tab = tab;
      this.tabid = tab.id;
      this.getStream();
   }

   clear(){
      this.tab = null;
      this.tabid = null;
      this.serveilanve = null;
      if(this.stream){
         let track = this.stream.getTracks();
         track.forEach((t) => {
            t.stop();
         });
      }
      this.stream = null;

      if(this.source)
      this.source.disconnect(this.panner);
      this.source = null;
      if(this.panner)
      this.panner.disconnect(audioCtx.destination);
      this.panner = null;
      this.stream = null;
   }

   connectStream(){
      this.source = audioCtx.createMediaStreamSource(this.stream);
      this.panner = audioCtx.createStereoPanner();
      this.source.connect(this.panner);
      this.panner.connect(audioCtx.destination);
   }

   getStream() {
      let that = this;
      chrome.tabCapture.capture(
         {video: false,  audio: true}, (stream) => {
            if (!stream) {
               console.error('Error starting tab capture: ' +
               (chrome.runtime.lastError.message || 'UNKNOWN'));
               return;
            }
            that.stream = stream;
            that.connectStream();
         }
      );
   }

   setPanValue(val){
      this.panner.pan.setValueAtTime(val, audioCtx.currentTime+0.2);
   }

   refreshIcon(){
      chrome.browserAction.setBadgeText({text: "ON"});
   }
}

class myTabArray{
   constructor(){
      this.init();
   }
   destructor(){
      this.clear();
   }

   init(){
      this.clear();
      this.tabMap = new Map();
   }

   clear(){
      if(this.tabMap)
      this.tabMap.clear();
      this.tabMap = null;
   }

   surveiStart(){
      this.surveiStop();
      this.surveillance = setInterval(() => {
         this.getDispWidth();
         chrome.windows.getAll({"populate" : true}, (chromeWindows) => {
            chromeWindows.forEach((cw) =>{
               console.log(window);
               let val;
               if(this.displayWidth)
                  val = (cw.left + cw.width/2) / this.displayWidth - 0.5
               else
                  val = (cw.left + cw.width/2) / window.parent.screen.width - 0.5;

               cw.tabs.forEach((tab) =>{
                  if(this.tabMap.has(tab.id)){
                     this.tabMap.get(tab.id).setPanValue(val);
                  }

               });
            });
         });
      }, 200);
   }

   surveiStop(){
      if(this.surveillance)
      clearInterval(this.surveillance);
   }

   addTab(tab){
      if(this.tabMap.has(tab.id)){
         this.tabMap.get(tab.id).destructor();
         this.tabMap.delete(tab.id);
         if(this.tabMap.size <= 0)
         this.surveiStop();
      }else{
         if(this.tabMap.size <= 0){
            this.surveiStart();
         }
         this.tabMap.set(tab.id, new myTabCapture(tab));
      }
   }

   deleteTabByID(tabID){
      if(this.tabMap.has(tabID)){
         this.tabMap.get(tabID).destructor();
         this.tabMap.delete(tabID)
         if(this.tabMap.size <= 0){
            this.surveiStop();
         }
      }
   }

   refreshIconByID(tabID){
      if(this.tabMap.has(tabID)){
         this.tabMap.get(tabID).refreshIcon();
      }
   }

   getDispWidth(){
      let that = this;
      chrome.storage.sync.get(["disp_x", "disp_y"], (items) => {
         that.displayWidth = items.disp_x;
      });
   }
}

const audioCtx = new AudioContext();
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const tabArray = new myTabArray;

/* set event listners*/
chrome.browserAction.onClicked.addListener((tab) => {
   tabArray.addTab(tab);
});

chrome.tabs.onRemoved.addListener((tabID, windowInfo) => {
   tabArray.deleteTabByID(tabID);
});
chrome.tabs.onSelectionChanged.addListener((tabID) => {
      chrome.browserAction.setBadgeText({text: ""});
   tabArray.refreshIconByID(tabID);
});

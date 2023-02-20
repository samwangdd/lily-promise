import Lily from './index';

const lily = new Lily(() => {
  console.log('Hello World!');
}).then((val) => { console.log('val :>> ', val); });

lily.then((val) => { console.log(val); });
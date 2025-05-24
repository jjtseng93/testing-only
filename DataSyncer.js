window.DataSyncer=class DataSyncer
{
  obj={};
  jsons=`{}`;
  fromserver=false;
  ret="";

  constructor(url,obj,jsons,th)
  {
    this.merge=this.localsync;
    this.commit=this.localsync;
    this.fetch=this.serversync;
    this.url = (url+'').trim() ;
    this.curl = this.url + "/timehash" ; 
    
    {
      this.obj=obj || this.obj;
      this.jsons=jsons || this.jsons;
      this.timestamp=Date.now();

      this.th = th || (this.timestamp + "RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=") ;

      this.hash=this.th.slice(13);
    }
  }

  static async create(url,obj)
  {
    url = url || "defaultdata";
    
    if(obj)
    {
      var jsons = JSON.stringify(obj) ;
      var th=await sha256Base64(jsons);
      th = Date.now()+th ;
    }
    return new DataSyncer(url,obj,jsons,th);
  }

  parse(ext)
  {
    if(ext != null)
      return [ ext.slice(0,13)*1, ext.slice(13) ] ;

    this.timestamp=this.th.slice(0,13)*1;
    this.hash=this.th.slice(13);
  }

  async serversync(dir=3,overwrite)
  {
    //  dir：1 上傳 , 2 下載, 3 雙向
    let ret="失敗";
    let rd=await anci.rf( this.curl, 'mem' );
    let [ts,hash]=this.parse(rd);
    let 內容不同 = (hash!=this.hash);
    let 內容相同 = (hash==this.hash);
    let 伺服器較新 = (ts>this.timestamp) ;
    let 伺服器較舊 = (this.timestamp>ts) ;
    
    if( dir===3 ) overwrite=false;

    if( dir===2 || dir===3 )
  {
    if( (內容不同 && 伺服器較新) || overwrite )
    {
      this.jsons=await anci.rf( this.url, 'mem' );
      this.timestamp = ts;
      this.hash = hash;
      this.th = ts+hash ;
      this.fromserver=true;
      ret="成功以伺服器→覆寫資料庫";
      if( (!內容不同 || !伺服器較新) && overwrite ) 
        ret+="，強制覆寫";
    }
  }  //  dir 2 3 下載

    if( dir===1 || dir===3 )
  {
    if( (內容不同 && 伺服器較舊) || overwrite )
    {
      await anci.wf( this.url, this.jsons, 'mem' );
      await anci.wf( this.curl, this.th, 'mem' );
      this.fromserver=false;
      ret="成功以資料庫→覆寫伺服器";
      if( (!內容不同 || !伺服器較舊) && overwrite ) 
        ret+="，強制覆寫";
    }
  }  //  dir 1 3 上傳


    return this.ret=ret;
  }  //  serversync

  async pull(overwrite)
  {
    let ret;
    ret = await this.serversync( 2, overwrite ) ;
    ret += "\n" + await this.merge();
    return this.ret=ret;
  }

  async push(overwrite)
  {
    return await this.serversync( 1, overwrite ) ;
  }

  async localsync()
  {
    let jsons=JSON.stringify(this.obj);
    let hash = await sha256Base64(jsons);
    let ts = Date.now();

    let ret="失敗";
    let 內容不同 = (hash!=this.hash);
    let 內容相同 = (hash==this.hash);
    let 資料庫較新 = (this.timestamp>ts) ;
    let 資料庫較舊 = (ts>this.timestamp) ;

    if( !this.fromserver && 內容不同 )
    {
      this.jsons=jsons;
      this.timestamp=ts;
      this.hash=hash;
      this.th=ts+hash;

      ret="成功以本地→覆寫資料庫";
    }
    else if( this.fromserver )
    {
      this.fromserver=false;
      let dbobj=JSON.parse(this.jsons);
      Object.assign(this.obj, dbobj)
      ret="成功以資料庫→覆寫本地";
    }

    return this.ret=ret;
  }  //  localsync
  

  print()
  {
    if(globalThis.alert) 
      var pf = x=>alert(x) ;
    else
      var pf = x=>console.log(x) ;

    pf(  JSON
           .stringify( [this.th,this.jsons,this.ret] ,
                             null, 1 )
    );
  }  //  print 

  async printserver()
  {
    if(globalThis.alert) 
      var pf = x=>alert(x) ;
    else
      var pf = x=>console.log(x) ;

    let th = await anci.rf( this.curl, 'mem' );
    let jsons = await anci.rf( this.url, 'mem' );

    pf(  JSON
           .stringify( [th,jsons,'伺服器'] ,
                             null, 1 )
    );
  }  //  printserver

}  //  class DataSyncer

function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

async function sha256Base64(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}

sha256Base64("hello").then(console.log);  // base64 字串
  
  a={1:2,3:4};

  d1=await DataSyncer.create( 'test', a);
  await d1.push();
  d1.print();

  b={};
  d2=await DataSyncer.create( 'test', b);
  d2.print();

/* 測試碼 執行anci的0.apk裏面


  setInterval( x=>{demo.innerText="**"+jss(a)+"****"+jss(b)}, 500);
  setInterval( x=>
  {
    d2.pull(true);
  } , 1000);

  setInterval( async ()=>
  {
    await d1.commit();
    d1.push(true);
  } , 1000);

  


*/

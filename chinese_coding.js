globalThis.顯示=alert;
cp = function compile(twjscode){

  let r=/(["'`、\/])(?:\\[\s\S]|(?!\1)[^\\])*\1/g

  let zhanwei = "`占位`" ;
  let matches = twjscode.match( r ); 
  let reps = twjscode.replace(r, zhanwei);

  let reptable=[  /(\n|^)[\s]*如果\（/g , r=>r.replace('如果','if') ,
        /(\n|^)[\s]*不然/g , r=>r.replace('不然','else') ,
   /(\n|^)[\s]*不然如果/g , r=>r.replace('不然如果','else if') ,
        /[\s]+開始[\s]+/g , r=>r.replace( '開始' , '{' ) ,
        /[\s]+結束[\s]+/g , r=>r.replace( '結束' , '}' ) ,
        "（" , "( " , "）" , " )" , "；" , " ;" , "：" , " : " , "。" , "." ,
        "，" , "," , "！" , "!" , "#" , "+", "～" , "=" , 
        "為" , "=" , "不是" , " != " , "是" , " == " , 
        /[\s]+設[\s]+/g , r=>r.replace( '設' , 'let' ) ,
        /[\s]+令[\s]+/g , r=>r.replace( '令' , 'var' ) ,
    /[\s]+全[\s]+/g , r=>r.replace( /全[\s]+/ , 'globalThis.' ) ,
        /[\s]+重複\(/g , r=>r.replace( '重複' , 'for' ) ,
  ];

  for( let i=0; i<reptable.length; i+=2 )
    reps=reps.replaceAll( reptable[i] , reptable[i+1] );

  for( let i=0; i<matches.length; i++ )
  {
    let s=matches[i] ;
    if( s.startsWith('、') )
      matches[i] = "`" + s.slice(1,-1) + "`" ;
  }

  let c=0;
  let recs = reps.replaceAll( zhanwei, r=>matches[c++])

    //alert2( reps )

  return recs;

};  //  end of function compile


eval(  cp(`


設 我 為 1；
設 一隻豬 為 1697；
如果（我是一隻豬）
    顯示（[、不棒棒、，、你好、]）；
不然 
    顯示（、好棒棒、#（我#一隻豬））；


`)  );


  

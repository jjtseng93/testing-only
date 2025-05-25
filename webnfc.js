// run in https://drjohnjstest.blogspot.com/2023/10/text-to-numbered-musical-notation.html?m=1

// 加入 UI 元素
if(!window.scanBtn)
{
  var html_Text = `<button id="scanBtn">開始掃描 NFC</button>`;
  $(tdebug).after(html_Text);
}

// 掃描功能
window.scanBtn.onclick=(async () => {
  if ('NDEFReader' in window) {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();

      alert("Scan your card now!");

      ndef.onreading = (event) => {

      //alert(objls(event));
        
      var sn=event.serialNumber+'';
      
      var decimal=parseInt(
        sn.split(":").reverse().join('')
      ,16)


      alert(decimal);

      var r=(event.message.records[0]);
      alert(jss({t:r.recordType,m:r.mediaType,id:r.id,enc:r.encoding,lang:r.lang,data:r.data}));

        // 處理 NDEF 記錄
        let recordInfo = '';
        for (const record of event.message.records) {
          const decoder = new TextDecoder(record.encoding || 'utf-8');
          const data = decoder.decode(record.data);
          recordInfo += `Record Type: ${record.recordType}\nData: ${data}\n`;
        }

        alert(`反序十進位序號: ${decimal}\n${recordInfo}`);
      };

    } catch (err) {
      alert("啟動掃描時發生錯誤：" + err);
    }
  } else {
    alert("此環境不支援 Web NFC");
  }
});

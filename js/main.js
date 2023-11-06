/*
  =================
  Головной модуль
  =================
*/
const
  _log=console.log,
  _warn=console.warn,
  _info=console.info,
  _err=console.error;

var
  app=null,               // General application object
  modCtrl=new ModCtrl();  // объект управления загрузкой модулей

/*
  Начальная инициализация.
*/
function bootstrap() {
  app=new App();
}

/*
  Вернёт true, если заданное число в одном из интервалов.
    n - число
    a - массив интервалов вида {left,right}
*/
function numInIntervals(n,a) {
  for (var i=0; i <a.length; i++) {
    if ((n >=a[i].l) && (n <a[i].r)) return true;
  }
  return false;
}

/*
  Из строки 'hh:mm' в объект {h,m,s}
*/
function strToHMobj(str) {
  return {
    h: Number(str.slice(0,2)),
    m: Number(str.slice(3)),
    s: 0
  };
}

/*
  Из объекта {h,m,s} в строку 'hh:mm'
*/
function hmObjToStr(hm) {
  return hm.h.toString().padStart(2,'0')+':'+hm.m.toString().padStart(2,'0');
}

/*
  Из Date() в {h,m,s}
*/
function time2HMS(dt) {
  return {h:dt.getHours(),m:dt.getMinutes(),s:dt.getSeconds()};
}

/*
  Убирает все выделения
*/
function clearSelection() {
  if (window.getSelection) window.getSelection().removeAllRanges();
  else if (document.selection) document.selection.empty();
}

/*
  Поворот фона.
  document.body.style.cssText='background-image: linear-gradient(30deg,#57aae1,#c8ecfb,#399ef7)';
*/
function turningBkg(clrs) {
  var
    deg=0,
    intervalId=setInterval(() => {
      if (deg >=180) {
        clearInterval(intervalId);
        _log('turning done');
      } else {
        document.body.style.cssText='background-image: linear-gradient('+deg+'deg,'+clrs.toString()+')';
        document.getElementById('info').innerHTML=deg;
        deg+=2;
      }
    },500);
}

/*
  Перемещение солнца по небу.
*/
function runningSun(clrs) {
  var
    percX=0,
    intervalId=setInterval(() => {
      if (percX ==100) {
        clearInterval(intervalId);
        _log('the sun has gone down');
      } else {
        document.body.style.cssText='background-image: radial-gradient(circle at '+percX+'% 140px,'+clrs[0]+' 32px,'+clrs[1]+' 48px,'+clrs[2]+')';
        document.getElementById('info').innerHTML=percX+'%';
        percX++;
      }
    },500);
}

/*
  Анимация горизонтального градиента.
  dawn - рассвет, sunset - закат.
*/
function dawnORsunset(dawn,clrs) {
  const
    finTxt=dawn ? 'midday!' : 'the sun has set...';

  var
    perc=1,
    step=1;
    percEnd=90;

  if (dawn) {
    perc=90;
    step=-1;
    percEnd=1;
  }

  var 
    intervalId=setInterval(() => {
      if (perc ==percEnd) {
        clearInterval(intervalId);
        _log(finTxt);
      } else {
        document.body.style.cssText='background-image: linear-gradient('+clrs[0]+' '+perc+'%,'+clrs.slice(1).toString()+')';
        document.getElementById('info').innerHTML=perc+'%';
        perc+=step;
      }
    },500);
}

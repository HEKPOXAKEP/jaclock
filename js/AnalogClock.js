/*
  =======================================
  Класс для отображения Аналоговых часов
  =======================================
*/
const
  DEG_1_SM=6,          // градусов на 1 секунду и минуту
  DEG_1_HR=30,         // градусов на 1 час
  DEG_ZERO=d2r(-90);   // начало отсчёта на 12:00

function d2r(dgrs) {
  return (Math.PI/180)*dgrs;
}

class AnalogClock extends AClock {

  constructor() {
    super();
    this.reinit();
  }

  reinit() {
    super.reinit();
    //this.drawFace();
    //this.drawSmile();
    this.paintClockFace();
  }

  /*
    Холст по id
  */
  static getCvs(id) {
    return document.getElementById(id);
  }

  /*
    Контекст холста.
    v - id холста или его объект
  */
  static getCtx(v) {
    if (typeof v ==='string')
      return AnalogClock.getCvs(v).getContext('2d');
    else
      return v.getContext('2d');
  }

  /*
    Координаты центра холста.
    v - id холста или его объект
  */
  static getCtr(v) {
    if (typeof v ==='string')
      var cvs=AnalogClock.getCvs(v);
    else
      cvs=v;

    return {cx:cvs.width/2,cy:cvs.height/2};
  }

  /*
    Рисуем циферблат
  */
  paintClockFace() {
    const
      cvs=AnalogClock.getCvs('ac-face'),
      ctx=AnalogClock.getCtx(cvs),
      ctr=AnalogClock.getCtr(cvs),
      r=(cvs.width-30)/2;

    cvs.width+=0;  // clear canvas

    drawFaceDashes();
    drawFaceHours();
    drawFaceHours();

    function drawFaceHours() {
      var ang;

      ctx.translate(cvs.width/2,cvs.height/2);

      ctx.font=r*0.15+'px arial';
      ctx.textBaseline='middle';
      ctx.textAlign='center';
      ctx.fillStyle='navy';

      for (let n=1; n <13; n++) {
        ang=n*Math.PI/6;

        ctx.rotate(ang);
        ctx.translate(0,-r*0.89);
        ctx.rotate(-ang);

        ctx.fillText(n.toString(),0,0);

        ctx.rotate(ang);
        ctx.translate(0,r*0.89);
        ctx.rotate(-ang);
      }

      //ctx.translate(-cvs.width/2,-cvs.height/2);
      ctx.setTransform(1,0,0,1,0,0);
    }

    function drawFaceDashes() {
      var ang,p1,p2;

      ctx.translate(cvs.width/2,cvs.height/2);

      ctx.strokeStyle='black';
      ctx.lineWidth=1;

      for (let i=0; i <60; i++) {
        ang=d2r(i*DEG_1_SM);

        ctx.rotate(ang);
        ctx.translate(0,-r-2);
        ctx.rotate(-ang);

        if (i%5 ==0) {
          /*ctx.fillStyle='cyan';
          ctx.fillRect(-1,-1,4,4);
          ctx.fillStyle='gray';
          ctx.strokeRect(-2,-2,5,5);*/
          ctx.fillStyle='red';
          ctx.beginPath();
          ctx.arc(0,0, 3, 0,Math.PI*2);
          ctx.stroke();
          ctx.fill();
          ctx.fillStyle='gray';
        } else
          ctx.fillRect(0,0,3,3);

        ctx.rotate(ang);
        ctx.translate(0,r+2);
        ctx.rotate(-ang);
      }

      ctx.setTransform(1,0,0,1,0,0);
    }
  }

  /*
    Рисуем часовую стрелку
  */
  displayHours(hours) {
    const
      cvs=AnalogClock.getCvs('ac-hour-hand'),
      ctx=AnalogClock.getCtx(cvs),
      ctr=AnalogClock.getCtr(cvs);

    /*ctx.clearRect(0,0,cvs.width,cvs.height);
    ctx.beginPath();*/
    ///cvs.width=cvs.width;
    cvs.width+=0;

    ctx.strokeStyle='blue';
    ctx.lineWidth=2;
    ctx.arc(ctr.cx,ctr.cy, 32, d2r(-90),d2r(-90+(hours<12?hours:hours-12)*DEG_1_HR));
    ctx.stroke();
  }

  /*
    Рисуем минутную стрелку
  */
  displayMinutes(minutes) {
    const
      cvs=AnalogClock.getCvs('ac-minute-hand'),
      ctx=AnalogClock.getCtx(cvs),
      ctr=AnalogClock.getCtr(cvs);

    // clearRect()
    cvs.width+=0;

    ctx.strokeStyle='green';
    ctx.lineWidth=2;
    ctx.arc(ctr.cx,ctr.cy, 24, d2r(-90),d2r(-90+minutes*DEG_1_SM));
    ctx.stroke();
  }

  /*
    Рисуем секундную стрелку
  */
  displaySeconds(seconds) {
    const
      cvs=AnalogClock.getCvs('ac-second-hand'),
      ctx=AnalogClock.getCtx(cvs),
      ctr=AnalogClock.getCtr(cvs);

    // clearRect()
    cvs.width+=0;

    ctx.strokeStyle='red';
    ctx.lineWidth=2;
    ctx.arc(ctr.cx,ctr.cy, 14, d2r(-90),d2r(-90+seconds*DEG_1_SM));
    ctx.stroke();
  }

  /* -------------------------------------------------------- */

  drawFace() {
    const
      ctx=AnalogClock.getCtx('ac-face');

    ctx.fillStyle='rgb(200,0,0)';
    ctx.fillRect(10,10, 55,50);

    ctx.fillStyle='rgba(0,0,200, 0.5)';
    ctx.fillRect(30,30, 55,50);

    ctx.strokeStyle='green';
    ctx.strokeRect(9,9, 86,80);

    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fill();
  }

  drawSmile() {
    const
      ctx=AnalogClock.getCtx('ac-face');

    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.arc(75,75,50,0,Math.PI*2,true); // Внешняя окружность
    ctx.moveTo(110,75);
    ctx.lineWidth=3;
    ctx.strokeStyle='red';
    ctx.arc(75,75,35,0,Math.PI,false); // рот (по часовой стрелке)
    ctx.moveTo(65,65);
    ctx.strokeStyle='black';
    ctx.arc(60,65,5,0,Math.PI*2,true); // Левый глаз
    ctx.moveTo(95, 65);
    ctx.arc(90, 65, 5, 0, Math.PI*2, true); // Правый глаз
    ctx.stroke();
  }

} /* --- Class AnalogClock --- */

/*
  Регистрируем класс визуализатора Аналоговых часов.
*/
registerClockClass('clkAnalog',AnalogClock);

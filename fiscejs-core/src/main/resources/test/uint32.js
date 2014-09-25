var MAX=104857600;
function loopII(){
	var array = new Int32Array(MAX);
	var i;
	for(i=0;i<MAX;i++){
		array[i] = 0x7FFFFFFF;
	}
}
function loopIU(){
	var array = new Int32Array(MAX);
	var i;
	for(i=0;i<MAX;i++){
		array[i] = 0x80000000;
	}
}
function loopUI(){
	var array = new Uint32Array(MAX);
	var i;
	for(i=0;i<MAX;i++){
		array[i] = 0x7FFFFFFF;
	}
}
function loopUU(){
	var array = new Uint32Array(MAX);
	var i;
	for(i=0;i<MAX;i++){
		array[i] = 0x80000000;
	}
}

var j;
var iiTime=0, iuTime=0, uiTime=0, uuTime=0;
for(var j=0;j<30;j++){
var t1,t2;
console.log("Round "+j);

t1=Date.now();
loopII();
t2=Date.now();
if(j>=10) iiTime+=(t2-t1);
console.log("iiTime: "+(t2-t1));

t1=Date.now();
loopIU();
t2=Date.now();
if(j>=10) iuTime+=(t2-t1);
console.log("iuTime: "+(t2-t1));

t1=Date.now();
loopUI();
t2=Date.now();
if(j>=10) uiTime+=(t2-t1);
console.log("uiTime: "+(t2-t1));

t1=Date.now();
loopUU();
t2=Date.now();
if(j>=10) uuTime+=(t2-t1);
console.log("uuTime: "+(t2-t1));

}

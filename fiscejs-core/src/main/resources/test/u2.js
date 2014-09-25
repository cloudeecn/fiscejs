var MAX=104857600;
var arr = new Uint32Array(3);
arr[0] = 0;
arr[1] = 0x80000000;
arr[2] = 0x7fffffff;

var arr2 = new Int32Array(3);
arr2[0] = 0;
arr2[1] = 0x80000000;
arr2[2] = 0x7fffffff;
function loopII(){
	var i;
	for(i=0;i<MAX;i++){
		arr2[0] = arr2[2];
	}
}
function loopIU(){
	var i;
	for(i=0;i<MAX;i++){
		arr2[0] = arr2[1];
	}
}
function loopUI(){
	var i;
	for(i=0;i<MAX;i++){
		arr[0] = arr[2];
	}
}
function loopUU(){
	var i;
	for(i=0;i<MAX;i++){
		arr[0] = arr[1];
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

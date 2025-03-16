var adder = function(first, second){
    var sum = first + second

    return sum;
}
var log = function(msg){
    console.log("[Log]: ", msg)
}

log('Welcome to sit737');
log('The sum is' +adder(5,6));
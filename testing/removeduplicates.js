
//remove duplicate values (===)
//find duplicate values (!==)
function remove(arr){
    const filtered= arr =>arr.filter((item,index)=>arr.indexOf(item)===index);
    return filtered;
}
let arr = [1, 2, 3, 2, 3, 4, 5, 4, 1, 4, 5];
console.log(remove(arr))
module.exports.isCollide = (x1, y1, w1, h1, x2, y2, w2, h2)=>{
    var XColl = false;
    var YColl = false;

    if ((x1 + w1 >= x2) && (x1 <= x2 + w2)) XColl = true;
    if ((y1 + h1 >= y2) && (y1 <= y2 + h2)) YColl = true;

    if (XColl & YColl) {
        console.log("Collide");
        return true;
    }
    return false;
};

module.exports.isInto = (x1, y1, s1, x2, y2, s2)=>{

};
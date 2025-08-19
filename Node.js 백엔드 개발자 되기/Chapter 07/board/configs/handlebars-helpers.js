module.exports = {
    lenghOfList: (list = []) => list.length,
    eq: (val, val2) => val1 == val2,
    dateString: (isoString) => new Date(isoString).toLocaleDateString(),
};
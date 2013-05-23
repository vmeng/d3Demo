var pwcColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
d3.scale.pwcColors = function() {
    return d3.scale.ordinal().range(pwcColors);
};
const factors = {
    plastic: 6,
    food: 2.5,
    paper: 1.5,
    metal: 4
};

function calculateCarbon(waste) {
    let total = 0;
    for (let type in waste) {
        total += waste[type] * factors[type];
    }
    return total;
}

function ecoScore(waste, recycled) {
    let score = 100;
    score -= waste.plastic * 5;
    score -= waste.food * 3;
    score += recycled * 8;

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    return score;
}

module.exports = { calculateCarbon, ecoScore };

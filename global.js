module.exports.constants = {
    LEVEL:
        {
            SMALL: 1,
            MEDIUM: 2,
            BIG: 3,
        },
    WEAPON:
        {
            //weapon types
            SIMPLE: 0,
            MEDIUM: 1,
            STRONG: 2,

            wpn_desc:
                [
                    {vel: 10, frequency: 400, damage: 5, patrons: 50, name: "simple",},
                    {vel: 7, frequency: 100, damage: 10, patrons: 100, name: "medium",},
                    {vel: 10, frequency: 700, damage: 20, patrons: 20, name: "strong",},

                ]
        },
    POWERUP:
        {
            PATRONS: 3,
            HEALTH: 4,
            SHIELD: 5,
            SPEED: 6,
            BERSERC: 7
        },
    DIFFICULTY:
        {
            EASY: 0,
            NORMAL: 1,
            HARD: 2,

            diff_desc:
                [
                    {vision: 400, accuracy: 35, name: "easy"},
                    {vision: 600, accuracy: 15, name: "normal"},
                    {vision: 800, accuracy: 10, name: "difficult"}
                ]
        }
};

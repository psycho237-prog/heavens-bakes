const proverbs = [
    "La gentillesse est un langage que les sourds peuvent entendre et que les aveugles peuvent voir.",
    "Le bonheur est un parfum que l'on ne peut répandre sur autrui sans en faire rejaillir quelques gouttes sur soi-même.",
    "Un sourire coûte moins cher que l'électricité, mais il donne autant de lumière.",
    "La douceur est comme le sucre : elle adoucit toutes les amertumes de la vie.",
    "Chaque jour est un cadeau, c'est pourquoi on l'appelle le présent.",
    "Le cœur qui donne rassemble toujours plus que la main qui prend.",
    "La patience est l'art d'espérer.",
    "La vraie générosité envers l'avenir consiste à tout donner au présent.",
    "Un mot de bonté vaut mieux qu'un gâteau au miel.",
    "Les petits ruisseaux font les grandes rivières.",
    "La vie est un dessert qu'il faut savourer lentement.",
    "Ce qui nourrit l'âme, c'est la tendresse du cœur.",
    "La joie est le soleil des âmes ; elle illumine celui qui la possède.",
    "Un cœur joyeux fait autant de bien qu'un médicament.",
    "La bienveillance est la chaîne d'or par laquelle la société est liée ensemble.",
    "Là où il y a de l'amour, il y a de la vie.",
    "Le secret du bonheur est de faire du bien aux autres.",
    "Les belles choses n'ont pas besoin d'être parfaites, elles n'ont besoin que d'être vraies.",
    "Un bon repas réconcilie avec le monde entier.",
    "La cuisine, c'est l'art de transformer instantanément en joie des produits chargés d'histoire.",
    "Manger est un besoin, savoir manger est un art.",
    "Le plaisir de la table est de tous les âges.",
    "Le sourire que tu envoies revient vers toi.",
    "Sois le changement que tu veux voir dans le monde.",
    "Chaque geste de gentillesse est une roseaux semée au jardin du monde.",
    "La gratitude est la mémoire du cœur.",
    "Toute grande réalisation a été un rêve avant d'être une réalité.",
    "Le monde appartient à ceux qui se lèvent tôt... et qui font de bonnes crêpes !",
    "La douceur d'un geste vaut plus que la grandeur d'un mot.",
    "Le partage est la seule opération mathématique où tout le monde gagne.",
]

export function getRandomProverb() {
    return proverbs[Math.floor(Math.random() * proverbs.length)]
}

export default proverbs

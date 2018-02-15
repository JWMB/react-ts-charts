export interface Interface1 {
    aStringOrNumber: number | string;
    myAnimal: Animal;
}
export class Animal {
    name: string;
}

export class Vertebrae extends Animal {
    numLegs: number;
}

export class Cat extends Vertebrae {
    numLegs = 4;
    canMeow = true;
}

export class MyAnimals {
    animals: (Animal | Cat)[];
    master: Animal;
}
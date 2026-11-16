function rollPers() {
    const raridade = Math.random() * 100;
    let raridadeStats = "comum";

    if (raridade < 0.1) {
        raridadeStats = "secreto";
    } else if (raridade < 0.9) {
        raridadeStats = "mitico";
    } else if (raridade < 4) {
        raridadeStats = "lendario";
    } else if (raridade < 10) {
        raridadeStats = "epico";
    } else if (raridade < 35) {
        raridadeStats = "raro";
    } else {
        raridadeStats = "comum";
    }

    const listaPers = rollPersGet(raridadeStats);
    if (listaPers.length === 0) return
    const getPers = Math.floor(Math.random() * listaPers.length);
    const persEscolhido = listaPers[getPers];
    personagens.forEach(element => {
        if (element.id !== persEscolhido) {return};
        desbloquearPersonagem(element.id);
    });
}

function rollPersGet(raridade) {
    const idEscolhidos = [];
    personagens.forEach(element => {
        if (element.raridade === raridade) {
            idEscolhidos.push(element.id);
        }
    });
    return idEscolhidos;
}

function rollBangboo() {
    const raridade = Math.random() * 100;
    let raridadeStats = "comum";

    if (raridade < 1) {
        raridadeStats = "lendario";
    } else if (raridade < 10) {
        raridadeStats = "epico";
    } else if (raridade < 50) {
        raridadeStats = "raro";
    } else {
        raridadeStats = "comum";
    }

    const listaBangboo = rollBangbooGet(raridadeStats);
    if (listaBangboo.length === 0) return
    const getBangboo = Math.floor(Math.random() * listaBangboo.length);
    const bangbooEscolhido = listaBangboo[getBangboo];
    bangboos.forEach(element => {
        if (element.id !== bangbooEscolhido) {return};
        desbloquearBangboo(element.id);
    });
}

function rollBangbooGet(raridade) {
    const idEscolhidos = [];
    bangboos.forEach(element => {
        if (element.raridade === raridade) {
            idEscolhidos.push(element.id);
        }
    });
    return idEscolhidos;
}
function Pagar() {
    const amount = document.getElementById('amountBoleto').value
    console.log(amount)
        const callback = (response) => {
            const { ok, description, transactionId } = response
            if (ok) {
            }

        };
        //la comprobacion y dependiendo se actualiza la pagina
        payWithPuntoYa(amount, callback);
};

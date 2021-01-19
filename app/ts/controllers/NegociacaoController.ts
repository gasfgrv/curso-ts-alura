import { domInject, throttle } from "../helpers/decorators/index"
import { Negociacao, NegociacaoParcial, Negociacoes } from "../models/index"
import { NegociacaoService, HandlerFunction } from "../services/index"
import { MensagemView, NegociacoesView } from "../views/index"
import { imprime } from "../helpers/index";

export class NegociacaoController {

    @domInject('#data')
    private _inputData: JQuery

    @domInject('#quantidade')
    private _inputQuantidade: JQuery

    @domInject('#valor')
    private _inputValor: JQuery

    private _negociacoes = new Negociacoes()
    private _negociacoesView = new NegociacoesView('#negociacoesView')
    private _mensagemView = new MensagemView('#mensagemView')

    private _service = new NegociacaoService()

    constructor() {
        this._negociacoesView.update(this._negociacoes)
    }

    @throttle()
    adiciona() {
        let data: Date = new Date(this._inputData.val().replace(/-/g, ','))
        let quantidade: number = parseInt(this._inputQuantidade.val())
        let valor: number = parseInt(this._inputValor.val())

        if (!this._ehDiaUtil(data)) {
            this._mensagemView.update('Somente Negociações em dias úteis.')
            return
        }

        const negociacao = new Negociacao(data, quantidade, valor)

        this._negociacoes.adiciona(negociacao)

        imprime(negociacao, this._negociacoes)

        this._negociacoesView.update(this._negociacoes)
        this._mensagemView.update('Negociação adicionada com sucesso!')
    }

    private _ehDiaUtil(data: Date): boolean {
        return data.getDay() != DiaDaSemana.Sabado && data.getDay() != DiaDaSemana.Domingo
    }

    @throttle()
    async importaDados() {
        try {
            const negociacoesParaImportar = await this._service.obterNegociacoes(res => {
                if (res.ok) {
                    return res
                } else {
                    throw new Error(res.statusText)
                }
            })
    
            const negociacoesJaImportadas = this._negociacoes.paraArray()
    
            negociacoesParaImportar
                .filter(negociacao => !negociacoesJaImportadas
                    .some(jaImportada => negociacao.ehIgual(jaImportada)))
                .forEach(negociacaoParaImportar => this._negociacoes.adiciona(negociacaoParaImportar))
    
            this._negociacoesView.update(this._negociacoes)
        } catch (err) {
            this._mensagemView.update(err.message)    
        }
    }
}

enum DiaDaSemana {
    Domingo,
    Segunda,
    Terca,
    Quarta,
    Quinta,
    Sexta,
    Sabado
}
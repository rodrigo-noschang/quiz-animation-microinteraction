# React Native Reanimated
Essa é a biblioteca que utilizaremos para fazer as animações, porque garante bastante possibilidades de animações, e desempenho já que elas são rodadas na thread de interface nativa do usuário. A documentação pode ser encontrada [aqui](https://docs.swmansion.com/react-native-reanimated/docs).

## Instalando React Native Reanimated:
Primeiro passo é fazer a instalação do Reanimated:

```shell
$ npx expo install react-native-reanimated
```

O segundo passo é adicionar seu plugin no arquivo `babel.config.js`:

```js
    module.exports = function(api) {
        api.cache(true);
        return {
            presets: ['babel-preset-expo'],
            plugins: ['react-native-reanimated/plugin'],
        };
    };
```

Tá feita a instalação e configuração. Porém, depois disso, é recomendado que executemos a aplicação usando a flag **--clear**, pra limpar a cache do bundler. Se não fizer essa limpeza, é possível que recebamos a mensagem de que o React Native Reanimated **não está disponível**:

```shell
    $ npx expo start --clear
```

Essa flag só precisa ser usada na primeira vez que rodarmos o projeto pós instalação. 

## Pilares para criar animação usando o RNR:
Toda animação feita usando essa biblioteca vai exigir esses 3 pilares: **usedSharedValue**, **usedAnimatedStyles** e **Animated Component**.

## Use Shared Value:
Utilizado pra criar uma variável cujo conteúdo (cujo valor) será utilizado nas animações, ou seja, para que as animações sejam reativas ao valor dessa variável. Para cria-lá, fazemos uso do hook e já definimos um valor incial:

```javascript
    const scale = useSharedValue(1);
```

## Use Animated Style:
É uma forma de criar estilizações não estáticas, como fazíamos no CSS puro e simples, essas estilizações vão reagir aos valores do **useSharedValues**. Nesse hook, passamos uma **arrow function** que retorna um objeto contendo essas animações.

```js
    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [{scale: scale.value}]
        }
    })
```
Nesse caso, estamos criando um estilo animado, e a propriedade que vai variar (que vai sofrer uma animação) é o scale do transform.

## Componente Animado:
Para poder usar esse estilo animado, precisamos aplicá-lo a um componente animado, se colocarmos no nosso componente comum, não vai rolar. Para isso, basta usar uma **Animated.View**, ao invés de uma **View** simples. Feito isso, colocamos o `animatedContainerStyle` dentro da lista de estilos que estão dentro do `style` desse componente:

```js
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
    ...

    <Animated.View style={
        [
          styles.container,
          animatedContainerStyle,
          { borderColor: COLOR, backgroundColor: isChecked ? COLOR : 'transparent' }
        ]
    }>
    ...
```

Essas mudanças diretas (manuais) no componente, às vezes, exigem um reload para serem aplicadas justamente por conta das animações do rnr serem rodadas numa **thread diferente** do javascript.

## Alterando o valor do shared value:
Para fazer alguma mudança no componente, basta que mudemos o valor do shared value, é tão simples quanto (esse alteração pode ser feita em um toque no componente ou algo assim): 

```js
    scale.value = 1.1;
```
Fazendo isso, o RNR já sabe que é pra mudar o tamanho do componente para 10% maior, já que o valor desse shared value está sendo usado no transform do nosso animatedStyle, que faz parte das animações do nosso Animated Component.

## Suavizando a transição:
Podemos usar alguns suavizadores padrões do RNR, como por exemplo, o **withSpring**, e seu uso é bastante simples, quando for alterar o valor do shared value:
```js
    scale.value = withSpring(1.1);
```

Além do valor do shared value, podemos também definir algumas configurações desse suavizador:

```js
    scale.value = withTiming(1.1, {duration: 1000, easing: Easing.bounce});
```

O **Easing** também é importado do rnr

## Interpolação de cores:
Para essa animação, vamos fazer com que a cor de fundo dos filtros do quiz façam uma transição mais suave entre o transparente e a sua própria cor. Essa mudança de cores é feita baseada no valor do **isChecked**, que é fornecido ao componente por Props, mas, como queremos que haja uma transição suave na cor, ou seja, que a cor mude gradualmente dependendo do valor dessa variável, ela não pode ser uma variável simples, precisa ser um **shared value**.

Então, criaremos uma variável de valor compartilhado e utilizaremos um useEffect que altera o valor dessa variável com base no valor do isChecked, se ele for false, a variável nova recebe 0, se for true, recebe 1. E também colocamos o próprio isChecked no array de dependência. Assim que fizermos essa estratégia para controle do valor da variável, vamos importar o **InterpolateColor** do `react-native-reanimated`.

Agora vamos criar um estilo animado para o nosso background usando o Interpolate Color, a criação fica da seguinte forma, reaproveitando o useAnimatedStyle de antes:

```js
    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [{scale: scale.value}],
            backgroundColor: interpolateColor(
                checked.value,
                [0, 1],
                ['transparent', COLOR]
            )
        }
    })
```

A função InterpolateColor recebe 3 parâmetros, o primeiro é **a variável** que dá origem à animação, que precisa ser um shared value, o segundo são **os valores que essa variável pode assumir**, e o terceiro, são **os valores que a propriedade vai assumir**, no nosso caso, a propriedade é o backgroundColor. Para deixar essa transição ainda mais sauve, e ainda mais visível, podemos alterar o valor do **checked.value** usando algum dos suavizadores, conforme visto acima.

## Criando componentes Animados:
Em alguns casos podemos quere aplicar animações em componentes que não nos são fornecidos dentro o `Animated`, como o caso do `Pressable`. Para contornar essa situação e poder ter um componente Pressable animável, podemos criar nosso próprio componente:

```js
    const PressableAnimated = Animated.createAnimatedComponent(Pressable);
```

Assim, podemos usar esse componente `PressableAnimated` no lugar do antigo Pressable, e passar todos os estilos animados para ele. Isso nos permite tirar componentes extras, como Views, que estavam no código somente para o uso da animação.

## Implementando animação de Shake:
A estrutura é basicamnete a mesma, teremos um shared value, um animated style e um animated component. A diferença é que, dessa vez, a animação de shake exige um translate horizontal que vai até um valor positivo (para levar o elemento à direita), e depois um valor negativo, ou zero (para levar o elemnto à esquerda) e então parecer que ele está tremendo. 

Então, ao invés de alterar o valor do shared value para um valor único, vamos usar uma sequencia de valores, com o **withSequence**, do próprio `react-native-reanimated`. Assim, podemos definir os valores da seguinte forma (e obviamente também podemos incluir os suavizadores):

```js
    const shake = useSharedValue(0);

    function shakeAnimation() {
        shake.value = withSequence(
          withTiming(3, {duration: 400, easing: Easing.bounce}), 
          withTiming(0)
        );
    }
```

Essa função pode ser chamada no momento em que queremos que o elemento seja "chacoalhado". Para o estilo animado, o padrão segue o mesmo também:

```js
    const shakeStyleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{translateX: shake.value}]
        }
    })    
```

Dessa forma, estamos usando o próprio valor do `shake` para deslocar o componente, podemos também usar o recurso do **interpolate**, também da lib do RNR, para que o componente de desloque de forma gradual e em diferente direções, usando o valor do shake como referência:

```js
    const shakeStyleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{
                translateX: interpolate(
                    shake.value,
                    [0, 0.5, 1, 1.5, 2, 2.5, 3],
                    [0, -15, 0, 15, 0, -15, 0]
                )
            }]
        }
    })
```

Para cada ponto no array dos valores do shake (o array que vai de 0 a 3) teremos um deslocamento equivalente no array abaixo dele. Assim, usando apenas uma sequencia de valores, conseguimos um deslocamento bidirecional e progressivo.

## Animações de Entrada e Saída:
O próprio RNR fornece várias animações prontas na sua biblioteca, e para aplicá-las é muito simples: Estando em um componente animado, temos acessoa a props **entering** e **exiting**. Basta selecionar alguma dessas animações e colocar nessas propriedades:

```js
    <Animated.View 
        entering = {FlipInYLeft.duration(800).easing(Easing.bounce)}
        exiting = {FlipOutYRight.duration(400)}
        style = {{width: 50, height: 50, backgroundColor: 'red'}}
    />
```

Também é possível detalhar o comportamento da função setando parâmetros dela como a duração, easing, delay, etc... É importante se atentar que animações com `In` no nome são usadas **exclusivamente** no entering, e animações com o `Out` no nome, **exclusivamente** no exiting =D. 

Podemos também fazer um efeito, numa lista de cards, por exemplo, onde os itens vão aparecendo um depois do outro, usando o index deles para multiplciar um valor de delay e, obviamente, usar isso para crar delays variados para os cards, dando o efeito de que eles aparecem um depois do outro. Usando o exemplo acima, ficaria mais ou menos assim:

```js
    <Animated.View 
        entering = {FlipInYLeft.duration(800).easing(Easing.bounce).delay(150 * index)}
        style = {{width: 50, height: 50, backgroundColor: 'red'}}
    />
```
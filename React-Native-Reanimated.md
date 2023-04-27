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
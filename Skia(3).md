# React Native Skia
Essa biblioteca serve para auxiliar no desenho e estilização de figuras mais complexas, sem precisar nos envolvermos tanto com o css delas.

## Instalação do Skia:
Como sempre, consultamos a [documentação de instalação](https://docs.expo.dev/versions/latest/sdk/skia/) e seguimos o passo a passo: 

```shell
    $ npx expo install @shopify/react-native-skia
```

## Criando figuras com o Skia:
O Skia nos fornece uma ferramenta chamada **Canvas**, que vai servir, como o próprio nome indica, como a nossa tela de desenho, dentro da qual poderemos criar nossas figuras mais complexas. Também de dentro da lib do skia conseguimos pegar várias formas geométricas que constam [na documentação](https://shopify.github.io/react-native-skia/docs/getting-started/hello-world).

Um exemplo, que usaremos no nosso caso é o retângulo. Com esse elemento em mãos, damos algumas informções básicas como posição inicial x e y, largura, altura, cores, etc. Também podemos pegar alguns filtros de edição e usá-los como filhos dessas figuras geométricas. No arquivo `OverlayFeedback.tsx` consta um exemplo de um retangulo com filtro de blur criado via Skia. 

Lá também vai estar a animação para que esse elemento pisque na tela, assim que o usuário Confirmar sua resposta. Basicamente com o skia desennhamos esse retangulo que ocupa a tela toda, e envolvemos ele com uma View animada. Assim que o usuário dá sua resposta, definimos um valor para um estado chamado `status`, que corresponde a uma cor no array **STATUS_COLORS** (0 é o transparente, quando o usuário ainda não respondeu, 1 é o verde para quando ele acertar e o 2 é o vermelho para quando ele erra). Esse estado define a cor do retangulo e também dispara o useEffect do `OverlayFeedback` que muda o valor compartilhado do `opacity` para 1 e depois para 0 (usando o withSequence). A partir disso, criamos o simples estilo animado que muda a opacidade da View.

## Sincronizando as Animações de erro:
Quando o usuário dá uma resposta errada no quiz, queremos que o card dê uma tremida (animação de Shake implementada no arquivo `React-Native-Reanimated.md`), mas também implementamos a animação do card sair rodando assim que ele confirma a resposta. Com essas duas animações rodando de forma paralela, acaba que o card que é chacoalhado é o próximo, o que além de estar errado, dá uma sensação bem estranha para o usuário.

Para corrigir isso, vamos implementar um recurso no momento em que mudamos o shared value da animação de shake. Para relembrarmos, aqui estão os shared values e a animação:

```js
    // A declaração do valor
    const shake = useSharedValue(0);

    // A função que o modifica:
    function shakeAnimation() {
        shake.value = withSequence(
            withTiming(3, {duration: 400, easing: Easing.bounce}), 
            withTiming(0)
        );
    }

    // A animação em si:
     const shakeStyleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{
                translateX: interpolate(
                    shake.value,
                    [0, 0.5, 1, 1.5, 2, 2.5, 3],
                    [0, -15, 0, -15, 0, 15, 0]
                )
            }]
        }
    })
```

A mudança que faremos será na função shakeAnimation. Como estamos utilizando o `withTiming` para alterar o valor do sharedValue, conseguimos detectar o momento em que essa mudança de valor (que acontece de forma gradual) chega no valor final, nesse caso, 0. Dentro do withTiming, conseguimos acessar um arrow function no terceiro parâmetro (já que o segundo são os modificadores do suavizador, coisas como delay, duration, etc):

```js
     function shakeAnimation() {
        shake.value = withSequence(
            withTiming(3, {duration: 400, easing: Easing.bounce}), 
            withTiming(0, undefined, (finished) => {
                'worklet';
                if(finished) {
                    runOnJS(handleNextQuestion)();
                }
            })
        );
    }
```

Uma outra forma de fazer isso é, numa animação já existente, usar o `withCallback`, como no caso da animação de exiting do **Question**. Já temos lá uma animação de exiting, para quando o elemento for desmontado. No nosso caso queremos setar o valor do state de `status` para zero novamente, para não quebrar o funcionamento da animação do OverlayFeedback. O uso do callback fica da seguinte forma, bastante similar ao anterior:

```js
     <Animated.View 
      style={styles.container}
      entering = {enteringKeyframe.duration(400)}  
      exiting = {exitingKeyframe.duration(400).withCallback(finished => {
        'worklet'
        if (finished) {
            runOnJS(onUnmount)()
        }
      })}
    >
```

Essa função `onUnmount` está sendo passada por prop, mas o que é importa mesmo é a estrutura da execução.

## Criando Elementos com Skia:
A ideia agora é criar o componente para indicar qual alternativa do quiz está selecionada. Vamos fazer um cículo ao lado da alternativa que, quando não selecionado, fica apenas uma borda cinza, quando selecionado, fica com um círculo menor verde dentro e uma borda verde é desenhada gradualmente ao redor desse círculo menor.

Para fazer essa borda que é desenhada gradualmente vamos primeiro criar um **Path** circular:

```js
    import { Canvas, Skia, Path } from '@shopify/react-native-skia';

    const path = Skia.Path.Make();
    path.addCircle(SIZE_X, SIZE_Y, RADIUS);
    ...

    <Canvas style = {{ width: 2 * SIZE_X, height: 2 * SIZE_Y }}>
        <Path
            path = {path}
            color = {THEME.COLORS.GREY_500}
            style = 'stroke'
            strokeWidth = {2}
        />
    </Canvas>
```

Assim já devemos ver um círculo vazio (apenas a borda) ao lado do texto da alternativa. Para definir o efeito da borda sendo desenhada, vamos atribuir um valor para a prop **start** (entre 0 e 1) e alternar os valores da prop **end** também entre 0 e 1, e assim a borda vai ser gradualmente desenhada. Verifique o arquivo `Option/index.tsx` para ver como é feito.

## Elementos de Animação com o Skia:
Para fazer animação com o Skia também precisamos de um "shared value", que a estilização consegue entender como algo que muda e, portanto, precisa aplicar uma animação sobre essa mudança. No caso do Skia, ao invés de usar um useSharedValue, usamos o **useValue**, e seu uso é bastante semelhante ao do RNR, tanto para a criação, quanto para a mudança de valor:

```js
    import { useValue } from '@shopify/react-native-skia';

    // Criação
    const percentage = useValue(0);

    // Atribuição
    percentage.current = 1;
    percengate.current = 0;
```

Assim como no RNR, quando fazemos a atribuição dessa forma, a mudança de valor ocorre de forma instantânea e brusca, por isso no Skia, também temos os suavizadores de transição. Semelhante ao `withTiming` temos o `runTiming`:

```js
    import { runTiming } from '@shopify/react-native-skia';

    // Atribuição
    runTiming(percentage, 1, { duration: 700 })
    runTiming(percentage, 0, { duration: 700 })
```

E para que esse valor seja levado em consideração na animação, não é necessário criar um estilo animado, basta fornecê-lo direto à propriedade do elemento que queremos animar:

```jsx
    <Canvas style = {{ width: 2 * SIZE_X, height: 2 * SIZE_Y }}>
        <Path
            path = {path}
            color = {THEME.COLORS.GREY_500}
            style = 'stroke'
            strokeWidth = {2}
            start = {0}
            end = {percentage}
        />
    </Canvas>
```

Para fazer o círculo de dentro dessa opção, vamos pegar direto o elemento **Circle** de dentro do Skia e também, como queremos que ele apareça de forma suavizada, também vamos criar um valor específico pra ele:

```jsx
    const circle = useValue(0);
    ...

    // Easing também é importado do Skia
    runTiming(circle, CENTER_CIRCLE, { duration: 500, easing: Easing.bounce })
    runTiming(circle, 0, { duration: 200 })
    ...

    <Circle
        cx = {28}
        cy = {28}
        r = {circle}
        color = {THEME.COLORS.BRAND_LIGHT}
    />
```

Novamente, veja toda a lógica implementada no arquivo `Option/index.tsx`, também com o BlurMask para dar um efeitinho mais bacana.
# Microinterações:
Detalhes funcionais e interativos, baseados nos gestos do usuário, que tornam o envolvimento com a aplicação mais agradável. Se dividem em vários tipos: sonora, visual, tátil, etc. Dos gestos, também temos vários: toque, toque, duplo, pinça (zoom in e zoom out), scroll, rotação, etc...

## React Native Gesture Handler:
Como o próprio nome diz, lida com os gestos do usuário.

## Instalação:
Basta seguir as instalações para um projeto **Managed Expo**, [na documentação](https://docs.swmansion.com/react-native-gesture-handler/docs/installation). Primeiro fazemos a instalação do pacote:

```shell
    $ npx expo install react-native-gesture-handler
```

E também, na raiz da nossa aplicação, no `App.tsx`, preciamos englobar toda ela com o **GestureHandlerRootView**, e colocar a importação geral do pacote no seu início. É interessante que as duas importações, a do pacote geral, e a do GestureHandlerRootView fiquem separadas (verifique o App.tsx para ver como ficou).

## Efeito de Swipe:
Vamos implementar, na lista de histórico, uma funcionalidade de puxar um dos itens da lista (um dos quizes) para o lado e então aparecer a opção de deletá-lo. Primeiro, vamos importar o **Swipeable** da biblioteca que acabamos de instalar e envolver o componente que queremos tornar swipeable, no nosso caso, o card no histórico dos quizes. Dentro do Swipeable, podemos acessar a props **renderLeftAction**, e passar para ele uma arrow function com o componente que queremos que seja **renderizado à esquerda** do card, quando ele for **puxado para a direita**.

Feito isso, essa funcionalidade já está implementada, mas ainda precisamos acertar alguns detalhes de estilização para deixar tudo alinhado e mais bonitinho, o estilo do componente que será mostrado pode ser definido normalmente através da prop `style`. 

Também é interessante definir uma limitação para o quanto que esse elemento pode ser puxado para a direita ou esquerda. Vamos definir para que esse swipe seja permitido apenas para que o elemento atrás dele seja descoberto. Isso pode ser definido na prop **overshootLeft = {false}** do Swipeable. A versão final do componente fica assim:

```javascript
    history.map((item) => (
        <Animated.View
            key={item.id}
            entering = {SlideInLeft}
            exiting = {SlideOutRight}
            layout = {Layout.springify()}   
        >
            <Swipeable
                overshootLeft = {false}
                containerStyle = {styles.swipeableContainer}
                renderLeftActions = {() => (
                    <Pressable onPress={() => handleRemove(item.id)} style = {styles.swipeableRemove}>
                        <Trash size = {32} color = {THEME.COLORS.GREY_100}/>
                    </Pressable>
                )}
            >
                <HistoryCard data={item} />
            </Swipeable>
        </Animated.View>
    ))
```

## Fechando o swipe com o uso do Ref:
Aqui queremos realizar o seguinte: caso o usuário clique para deletar, mas não delete o card, o Swipe dele continua aberto, ou seja, o ícone da lixeira continua aparecendo, queremos que ele seja fechado e o componente volta para seu estado normal. A ideia será criar um array, para deixar salvo nele a referência de cada menu, cada card. Primeiro vamos criar esse array usando o **useRef** (importado do próprio `react`) e vamos usar o nosso componente para inserí-lo dentro desse array:

```javascript
    const swipeableRefs = useRef<Swipeable[]>([]);
    ...

    // Dentro do return, na renderização do componente
    <Swipeable
        ref = {(ref) => {
            if (ref) {
                swipeableRefs.current.push(ref);
            }
        }}
    >
```

Dessa forma, já temos a referencia de todos os nossos swipebles dentro do array. Agora, para função de remoção `handleRemove`, ao invés de passarmos somente o id do item que vai ser removido, vamos passar também seu index, já que o index do item na lista de históricos será o mesmo index do item na lista de refs. Assim, conseguiremos acessar o item na "DOM" no react-native e aplicar uma função de **close()** nele para que ele seja fechado. A função de remoção fica da seguinte forma, antes mesmo do alert ser exibido:

```javascript
function handleRemove(id: string, index: number) {
    swipeableRefs.current?.[index].close(); // Função de fecha o swipe e esconde a lixeira novamente.

    Alert.alert(
      'Remover',
      'Deseja remover esse registro?',
      [
        {
          text: 'Sim', onPress: () => remove(id)
        },
        { text: 'Não', style: 'cancel' }
      ]
    );
}
```

E claro, a chamada da função no componente de Swipe precisa agora inlcuir esse valor:

```js
    <Swipeable
        ref = {(ref: any) => {
            if (ref) {
                swipeableRefs.current.push(ref);
            }
        }}
        overshootLeft = {false}
        containerStyle = {styles.swipeableContainer}
        renderLeftActions = {() => (
            <Pressable onPress={() => handleRemove(item.id, index)} style = {styles.swipeableRemove}> // Lembrando que esse index vem lá do map feito sobre o history
                <Trash size = {32} color = {THEME.COLORS.GREY_100}/>
            </Pressable>
        )}
    >
```

## onSwiepeableOpen e threshold:
Vamos implementar um outro jeito de deletar o card, dessa vez apenas com o swipe, sem que o usuário precise clicar em nada depois (além da confirmação, claro). Para isso, vamos usar a prop **onSwipeableOpen**, que vai executar uma função (no nosso caso, a `handleRemove`) assim que o dispositivo identificar que aquele card foi "aberto", ou seja, assim que o swipe estiver completo. Também podemos definir qual valor vai dizer para o dispositivo quando esse swipe pode ser considerado completo. Definimos ele através dos thresholds, como no nosso caso o elemento está sendo mostrado à esquerda, vamos definir o **leftThreshold**. Também podemos inlcuir um **renderRightAction** para garantir que nada será renderizado quando o usuário puxar o item para a esquerda.

```js
     <Swipeable
        ref={(ref: any) => {
            if (ref) {
            swipeableRefs.current.push(ref);
            }
        }}
        containerStyle = {styles.swipeableContainer}
        overshootLeft = {false}
        leftThreshold = {20}
        onSwipeableOpen = {() => handleRemove(item.id, index)}
        renderLeftActions = {() => (
            <View style = {styles.swipeableRemove}>
            <Trash size = {32} color = {THEME.COLORS.GREY_100}/>
            </View>
        )}
        renderRightActions = {() => null}
    >
```

## Interações com ScrollView:
Em alguns casos, em alguns dispositivos de telas menores, pode ser que o scroll de alguma tela esconda um detalhe que queremos continuar mostrando, é o caso da nossa screen de Quiz, mesmo que o usuário dê o scroll até o final dela, queremos, por exemplo, deixar a barra de progresso daquele quiz sendo mostrada. Para podermos alterar o funcionamento dela, primeiro precisamos transformá-la numa **Animated.ScrollView**

Depois disso, podemos pegar o valor de offset dessa scrollview, usando a prop **onScroll** e o **useAnimatedScrollHandler** da seguinte forma:

```js
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        }
    })

    <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
    >
```

O próximo passo é criar um novo header, com o nome do quiz e uma outra barra de progresso que é o componente que vai ser exibido quando o Header normal do Quiz for escondido. Vamos criar esse header em cima da nossa ScrollView, já que ele será um elemento com position absolute. Para ver como ficaram as estilizações, veja a screen `Quiz/index.tsx` `Quiz/styles.ts`.

Feito isso, vamos usar o **interpolate** para animar essa View, ou seja, esse header que ficará fixo. Vamos primeiro, dentro da animação desse header, ou seja, `fixedProgressBarStyles`, definir uma transição suave tanto para a opacidade, quanto para o translateY, de forma que, conforme o usuário vá scrollando o quiz para baixo, esse novo header que acabamos de criar fique visível e vá "caindo" para dentro da tela:

```js
    const fixedProgressBarStyles = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            zIndex: 1,
            paddingTop: 50,
            backgroundColor: THEME.COLORS.GREY_500,
            width: '110%',
            left: '-5%',
            opacity: interpolate(scrollY.value, [50, 90], [0, 1], Extrapolate.CLAMP),
            transform: [
                {translateY: interpolate(scrollY.value, [50, 90], [-40, 0], Extrapolate.CLAMP)}
            ]
        }
    }) 
```

As pripriedades que mais nos interessam aqui são o opacity e o transform, o resto poderia ter sido feito numa estilização estática, sem o uso do animatedStyle. O interpolate foi usado da mesma forma que antes (no Arquivo `React-Native-Reanimated.md`), a unica coisa nova aqui é o **Extrapolate.CLAM**, que serve para que a animação não rode em valores não estipulados pelos valores do input, ou seja, para que a animação só altere o opacity e o translateY quando o scrollY.value estiver entre 50 e 90. 

Para dar uma enfeitada aqui, podemos também fazer com que o componente `QuizHeader` vá desaparecendo progressivamente, conforme esse nosso novo componente aparece:
```js
    const disappearingHeader = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [60, 90], [1, 0])
        }
    })
```
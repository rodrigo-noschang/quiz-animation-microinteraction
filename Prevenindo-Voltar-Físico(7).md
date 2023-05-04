# Prevenindo voltar físico:
Se o usuário clicar em "Parar" enquanto estiver no meio de um Quiz, estamos emitindo um Alerta que pede a confirmação dele para voltar mesmo, porém, se o usuário acionar o ato de voltar físico do dispositivo (botão, no caso do Android e o arrastar no caso do iOS) ele vai sair do quiz automaticamente, sem pedir a confirmação. É isso que vamos prevenir agora.

Para **prevenir isso no iOS** basta que desabilitemos os gestos nas telas em que queremos impedir isso. No nosso caso, queremos que ele não consiga fazer isso na tela do Quiz portanto, faremos a seguinte modificação no componente que representa essa tela no arquivo `app.routes.tsx`:

```jsx
    <Screen
        name="quiz"
        component={Quiz}
        options={{gestureEnabled: false}}
    />
```

Poderíamos também passar essa informação **gestureEnabled: false** no screenOptions do Navigator, mas assim ele ficaria desabilitado em todas as telas, o que não é o desejado aqui. Queremos apenas impedir isso na tela de **Quiz** e na tela **Finish**. Podemos setar essa informação manualmente em cada uma telas delas, ou podemos usar o **Group** do próprio `createNativeStackNavigator` para setar essa propriedade que elas tem em comum:

Individualmente (funciona normalzin tbm): 

```jsx
    <Screen
        name="quiz"
        component={Quiz}
        options={{gestureEnabled: false}}
    />

    <Screen
        name="finish"
        component={Finish}
        options={{gestureEnabled: false}}
    />
```

Agrupado:

```jsx
    const { Navigator, Screen, Group } = createNativeStackNavigator();

    <Group screenOptions={{gestureEnabled: false}}>
        <Screen
            name="quiz"
            component={Quiz}
        />
        <Screen
            name="finish"
            component={Finish}
        />
    </Group>
```

Para **prevenir isso no Android**, vamos usar o **BackHandler** do próprio `react-native` da seguinte forma:

```js
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleStop);

        return () => backHandler.remove();
    }, [])
```

Ou seja, criamos uma instância dele com um eventListener para um hardwareBackPress, que é o voltar fisico do Android. Quando esse evento for detectado, chamaremos a função handleStop. Depois, é importantíssimo remover esse eventListener no return do useEffect. Faremos a mesma coisa na tela do Finish.
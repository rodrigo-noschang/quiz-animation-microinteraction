# Expo AV:
Vamos utilizar [essa biblioteca](https://docs.expo.dev/versions/latest/sdk/av/?utm_source=google&utm_medium=cpc&utm_content=performancemax&gclid=Cj0KCQjwr82iBhCuARIsAO0EAZwLr0B20oJwvrNohNB6aqNKYHaDqECnMjThneYTPVHBSgHu7Q0DsagaAitfEALw_wcB) para fazer os efeitos sonors e tátil, para isso, instalá-la emos:

```shell
    $ npx expo install expo-av
```

## Tocando audio com o AV:
O seguinte trecho de códgio serve para selecionar o arquivo de áudio (nesse caso, de forma condicional), criar um objeto que representa esse arquivo de áudio, e depois executar ele garantindo que ele comece do começo:

```js
    import { Audio } from 'expo-av';

    async function playSound(isCorret: boolean) {
        const file = isCorret ? require('../../assets/correct.mp3') : require('../../assets/wrong.mp3');
        const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true });

        await sound.setPositionAsync(0);
        await sound.playAsync();
    }
```

## Vibrando o celular:
Para implementar a vibração, vamos usar a lib [**Expo Haptics**](https://docs.expo.dev/versions/latest/sdk/haptics/?utm_source=google&utm_medium=cpc&utm_content=performancemax&gclid=Cj0KCQjwr82iBhCuARIsAO0EAZxK5mq0Bb7FElVkZA71scFV8UM61QOVrgw2q9FEUyp3aZfskRFUtdYaAo5IEALw_wcB)! Instalando a lib:

```shell
    $ npx expo install expo-haptics
```

Vamos implementar a vibração na mesma animação que faz o efeito de chacoalhar o card quando o usuário erra a resposta. 

```js
    import * as Haptics from 'expo-haptics';

    async function shakeAnimation() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        shake.value = withSequence(
        withTiming(3, {duration: 400, easing: Easing.bounce}), 
        withTiming(0, undefined, (finished) => {
                'worklet';
                if (finished) {
                runOnJS(handleNextQuestion)();
                }
            })
        );
    }
```

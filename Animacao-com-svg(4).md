# Criando a animação com o SVG:
Depois de ter as imagens em mãos, vamos instalar o pacote de expo que nos permite trabalhar com SVGs, o [Expo SVG](https://docs.expo.dev/versions/latest/sdk/svg/?utm_source=google&utm_medium=cpc&utm_content=performancemax&gclid=CjwKCAjwjMiiBhA4EiwAZe6jQ1NMt__W_MZ6roq9zqwFu9bdlOEmd8y8kDDOYDoo1Xd87f6yyO0qvRoCGZkQAvD_BwE) e [React Native SVG Transformer](https://github.com/kristerkari/react-native-svg-transformer):

```shell
    $ npx expo install react-native-svg
    e
    $ npm i react-native-svg-transformer --save-dev
```

Para a configuração do segundo pacote, vamos criar o arquivo `metro.config.js` e jogar o seguinte trecho de código lá dentro:

```js
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return config;
})();
```

Também adicionaremos a declaração da tipagem do svg dentro do arquivo `@types/svg.d.ts`:
```js
    declare module "*.svg" {
        import React from 'react';
        import { SvgProps } from "react-native-svg";
        const content: React.FC<SvgProps>;
        export default content;
    }
```

## Criando a Estilização do troféu e das estrelas:
Essa animação aparecerá ao final de todos os quizes, com o troféu fixo e as estrelas piscando de forma animada, tudo isso feito no arquivo `Stars/index.tsx`. Vamos colocar o troféu normalmente como o SVG que ele é, e depois vamos criar um **Path** para cada estrela, ou seja, para cada path de dentro do arquivo `src/assets/starts.svg`. A lógica para a criação das estrelas é bastante simples, basta criar um elemento Path e, na prop path, passar cada um dos paths existentes nesse arquivo. Depois disso, colorir as estrelas conforme o figma. Para colorir as estrelas, usaremos o **LinearGradient**. A primeira estrela (o primeiro path fica da seguinte forma):

```jsx
    <Canvas style = {styles.canvas}>
        <Path 
            path = 'M232.405 231.922C232.005 231.922 231.648 231.666 231.52 231.287C229.729 225.979 228.387 224.638 223.079 222.846C222.7 222.718 222.444 222.362 222.444 221.961C222.444 221.561 222.7 221.204 223.079 221.076C228.388 219.285 229.729 217.943 231.52 212.635C231.648 212.255 232.004 212 232.405 212C232.806 212 233.162 212.255 233.29 212.635C235.082 217.943 236.423 219.284 241.731 221.076C242.11 221.204 242.366 221.561 242.366 221.961C242.366 222.362 242.11 222.718 241.731 222.846C236.423 224.638 235.082 225.979 233.29 231.287C233.162 231.666 232.806 231.922 232.405 231.922Z'
        >
            <LinearGradient 
                start = {{x: 222, y: 212}}
                end = {{x: 238, y: 222}}
                colors = {[THEME.COLORS.STAR_BLUE, THEME.COLORS.STAR_GREEN]}  
            />
        </Path>
    </Canvas>
```

As informações de start, end e colors, estão todas contidas na tag `linearGradient` do arquivo svg das stars. O primeiro linearGradient refere-se ao primeiro path, e assim por diante...

## Animando as estrelas (Animação em Loop):
Para criar essas animações, aparentemente, basta criarmos uma duração e o tipo da animação e jogar na propriedade que queremos que seja animada. No caso, como queremos que as estrelas pisquem, vamos mexer na opacidade delas. Para deixá-las em loop, vamos usar o **useLoop do Skia:

```js
    const frontStarsBlinkAnimated = useLoop({
        duration: 2600,
        easing: Easing.ease
    })

    <Path 
        path = 'M232.405 231.922C232.005 231.922 231.648 231.666 231.52 231.287C229.729 225.979 228.387 224.638 223.079 222.846C222.7 222.718 222.444 222.362 222.444 221.961C222.444 221.561 222.7 221.204 223.079 221.076C228.388 219.285 229.729 217.943 231.52 212.635C231.648 212.255 232.004 212 232.405 212C232.806 212 233.162 212.255 233.29 212.635C235.082 217.943 236.423 219.284 241.731 221.076C242.11 221.204 242.366 221.561 242.366 221.961C242.366 222.362 242.11 222.718 241.731 222.846C236.423 224.638 235.082 225.979 233.29 231.287C233.162 231.666 232.806 231.922 232.405 231.922Z'
        opacity={frontStarsBlinkAnimated}
    >
```

Por fim, para a animação do troféu colocaremos um simples bounceIn na entrada dele.
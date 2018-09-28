var assert = require('assert');
var elliptic = require('../');
var utils = elliptic.utils;
var hash = require('hash.js');

describe('Hmac_DRBG', function() {
  it('should support hmac-drbg-sha256', function() {
    function doDrbg(opt) {
      var drbg = elliptic.hmacDRBG({
        hash: hash.sha256,
        entropy: opt.entropy,
        nonce: opt.nonce,
        pers: opt.pers
      });
      return drbg.generate(opt.size, 'hex');
    }

    var test = [
      {
        entropy: 'totally random0123456789',
        nonce: 'secret nonce',
        pers: 'my drbg',
        size: 32,
        res: '018ec5f8e08c41e5ac974eb129ac297c5388ee1864324fa13d9b15cf98d9a157'
      },
      {
        entropy: 'totally random0123456789',
        nonce: 'secret nonce',
        pers: null,
        size: 32,
        res: 'ed5d61ecf0ef38258e62f03bbb49f19f2cd07ba5145a840d83b134d5963b3633'
      },
    ];
    for (var i = 0; i < test.length; i++)
      assert.equal(doDrbg(test[i]), test[i].res);
  });

  describe('NIST vector', function() {
    function test(opt) {
      it('should not fail at ' + opt.name, function() {
        var drbg = elliptic.hmacDRBG({
          hash: hash.sha256,
          entropy: opt.entropy,
          entropyEnc: 'hex',
          nonce: opt.nonce,
          nonceEnc: 'hex',
          pers: opt.pers,
          persEnc: 'hex'
        });

        for (var i = 0; i < opt.add.length; i++) {
          var last = drbg.generate(opt.expected.length / 2,
                                   'hex',
                                   opt.add[i],
                                   'hex');
        }
        assert.equal(last, opt.expected);
      });
    }

    var vector = function() {/*
      COUNT = 0
      EntropyInput = ca851911349384bffe89de1cbdc46e6831e44d34a4fb935ee285dd14b71a7488
      Nonce = 659ba96c601dc69fc902940805ec0ca8
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = e528e9abf2dece54d47c7e75e5fe302149f817ea9fb4bee6f4199697d04d5b89d54fbb978a15b5c443c9ec21036d2460b6f73ebad0dc2aba6e624abf07745bc107694bb7547bb0995f70de25d6b29e2d3011bb19d27676c07162c8b5ccde0668961df86803482cb37ed6d5c0bb8d50cf1f50d476aa0458bdaba806f48be9dcb8

      COUNT = 1
      EntropyInput = 79737479ba4e7642a221fcfd1b820b134e9e3540a35bb48ffae29c20f5418ea3
      Nonce = 3593259c092bef4129bc2c6c9e19f343
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = cf5ad5984f9e43917aa9087380dac46e410ddc8a7731859c84e9d0f31bd43655b924159413e2293b17610f211e09f770f172b8fb693a35b85d3b9e5e63b1dc252ac0e115002e9bedfb4b5b6fd43f33b8e0eafb2d072e1a6fee1f159df9b51e6c8da737e60d5032dd30544ec51558c6f080bdbdab1de8a939e961e06b5f1aca37

      COUNT = 2
      EntropyInput = b340907445b97a8b589264de4a17c0bea11bb53ad72f9f33297f05d2879d898d
      Nonce = 65cb27735d83c0708f72684ea58f7ee5
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = 75183aaaf3574bc68003352ad655d0e9ce9dd17552723b47fab0e84ef903694a32987eeddbdc48efd24195dbdac8a46ba2d972f5808f23a869e71343140361f58b243e62722088fe10a98e43372d252b144e00c89c215a76a121734bdc485486f65c0b16b8963524a3a70e6f38f169c12f6cbdd169dd48fe4421a235847a23ff

      COUNT = 3
      EntropyInput = 8e159f60060a7d6a7e6fe7c9f769c30b98acb1240b25e7ee33f1da834c0858e7
      Nonce = c39d35052201bdcce4e127a04f04d644
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = 62910a77213967ea93d6457e255af51fc79d49629af2fccd81840cdfbb4910991f50a477cbd29edd8a47c4fec9d141f50dfde7c4d8fcab473eff3cc2ee9e7cc90871f180777a97841597b0dd7e779eff9784b9cc33689fd7d48c0dcd341515ac8fecf5c55a6327aea8d58f97220b7462373e84e3b7417a57e80ce946d6120db5

      COUNT = 4
      EntropyInput = 74755f196305f7fb6689b2fe6835dc1d81484fc481a6b8087f649a1952f4df6a
      Nonce = c36387a544a5f2b78007651a7b74b749
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = b2896f3af4375dab67e8062d82c1a005ef4ed119d13a9f18371b1b873774418684805fd659bfd69964f83a5cfe08667ddad672cafd16befffa9faed49865214f703951b443e6dca22edb636f3308380144b9333de4bcb0735710e4d9266786342fc53babe7bdbe3c01a3addb7f23c63ce2834729fabbd419b47beceb4a460236

      COUNT = 5
      EntropyInput = 4b222718f56a3260b3c2625a4cf80950b7d6c1250f170bd5c28b118abdf23b2f
      Nonce = 7aed52d0016fcaef0b6492bc40bbe0e9
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = a6da029b3665cd39fd50a54c553f99fed3626f4902ffe322dc51f0670dfe8742ed48415cf04bbad5ed3b23b18b7892d170a7dcf3ef8052d5717cb0c1a8b3010d9a9ea5de70ae5356249c0e098946030c46d9d3d209864539444374d8fbcae068e1d6548fa59e6562e6b2d1acbda8da0318c23752ebc9be0c1c1c5b3cf66dd967

      COUNT = 6
      EntropyInput = b512633f27fb182a076917e39888ba3ff35d23c3742eb8f3c635a044163768e0
      Nonce = e2c39b84629a3de5c301db5643af1c21
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = fb931d0d0194a97b48d5d4c231fdad5c61aedf1c3a55ac24983ecbf38487b1c93396c6b86ff3920cfa8c77e0146de835ea5809676e702dee6a78100da9aa43d8ec0bf5720befa71f82193205ac2ea403e8d7e0e6270b366dc4200be26afd9f63b7e79286a35c688c57cbff55ac747d4c28bb80a2b2097b3b62ea439950d75dff

      COUNT = 7
      EntropyInput = aae3ffc8605a975befefcea0a7a286642bc3b95fb37bd0eb0585a4cabf8b3d1e
      Nonce = 9504c3c0c4310c1c0746a036c91d9034
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = 2819bd3b0d216dad59ddd6c354c4518153a2b04374b07c49e64a8e4d055575dfbc9a8fcde68bd257ff1ba5c6000564b46d6dd7ecd9c5d684fd757df62d85211575d3562d7814008ab5c8bc00e7b5a649eae2318665b55d762de36eba00c2906c0e0ec8706edb493e51ca5eb4b9f015dc932f262f52a86b11c41e9a6d5b3bd431

      COUNT = 8
      EntropyInput = b9475210b79b87180e746df704b3cbc7bf8424750e416a7fbb5ce3ef25a82cc6
      Nonce = 24baf03599c10df6ef44065d715a93f7
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = ae12d784f796183c50db5a1a283aa35ed9a2b685dacea97c596ff8c294906d1b1305ba1f80254eb062b874a8dfffa3378c809ab2869aa51a4e6a489692284a25038908a347342175c38401193b8afc498077e10522bec5c70882b7f760ea5946870bd9fc72961eedbe8bff4fd58c7cc1589bb4f369ed0d3bf26c5bbc62e0b2b2

      COUNT = 9
      EntropyInput = 27838eb44ceccb4e36210703ebf38f659bc39dd3277cd76b7a9bcd6bc964b628
      Nonce = 39cfe0210db2e7b0eb52a387476e7ea1
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = e5e72a53605d2aaa67832f97536445ab774dd9bff7f13a0d11fd27bf6593bfb52309f2d4f09d147192199ea584503181de87002f4ee085c7dc18bf32ce5315647a3708e6f404d6588c92b2dda599c131aa350d18c747b33dc8eda15cf40e95263d1231e1b4b68f8d829f86054d49cfdb1b8d96ab0465110569c8583a424a099a

      COUNT = 10
      EntropyInput = d7129e4f47008ad60c9b5d081ff4ca8eb821a6e4deb91608bf4e2647835373a5
      Nonce = a72882773f78c2fc4878295840a53012
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = 0cbf48585c5de9183b7ff76557f8fc9ebcfdfde07e588a8641156f61b7952725bbee954f87e9b937513b16bba0f2e523d095114658e00f0f3772175acfcb3240a01de631c19c5a834c94cc58d04a6837f0d2782fa53d2f9f65178ee9c837222494c799e64c60406069bd319549b889fa00a0032dd7ba5b1cc9edbf58de82bfcd

      COUNT = 11
      EntropyInput = 67fe5e300c513371976c80de4b20d4473889c9f1214bce718bc32d1da3ab7532
      Nonce = e256d88497738a33923aa003a8d7845c
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = b44660d64ef7bcebc7a1ab71f8407a02285c7592d755ae6766059e894f694373ed9c776c0cfc8594413eefb400ed427e158d687e28da3ecc205e0f7370fb089676bbb0fa591ec8d916c3d5f18a3eb4a417120705f3e2198154cd60648dbfcfc901242e15711cacd501b2c2826abe870ba32da785ed6f1fdc68f203d1ab43a64f

      COUNT = 12
      EntropyInput = de8142541255c46d66efc6173b0fe3ffaf5936c897a3ce2e9d5835616aafa2cb
      Nonce = d01f9002c407127bc3297a561d89b81d
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = 64d1020929d74716446d8a4e17205d0756b5264867811aa24d0d0da8644db25d5cde474143c57d12482f6bf0f31d10af9d1da4eb6d701bdd605a8db74fb4e77f79aaa9e450afda50b18d19fae68f03db1d7b5f1738d2fdce9ad3ee9461b58ee242daf7a1d72c45c9213eca34e14810a9fca5208d5c56d8066bab1586f1513de7

      COUNT = 13
      EntropyInput = 4a8e0bd90bdb12f7748ad5f147b115d7385bb1b06aee7d8b76136a25d779bcb7
      Nonce = 7f3cce4af8c8ce3c45bdf23c6b181a00
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = 320c7ca4bbeb7af977bc054f604b5086a3f237aa5501658112f3e7a33d2231f5536d2c85c1dad9d9b0bf7f619c81be4854661626839c8c10ae7fdc0c0b571be34b58d66da553676167b00e7d8e49f416aacb2926c6eb2c66ec98bffae20864cf92496db15e3b09e530b7b9648be8d3916b3c20a3a779bec7d66da63396849aaf

      COUNT = 14
      EntropyInput = 451ed024bc4b95f1025b14ec3616f5e42e80824541dc795a2f07500f92adc665
      Nonce = 2f28e6ee8de5879db1eccd58c994e5f0
      PersonalizationString =
      AdditionalInput =
      AdditionalInput =
      ReturnedBits = 3fb637085ab75f4e95655faae95885166a5fbb423bb03dbf0543be063bcd48799c4f05d4e522634d9275fe02e1edd920e26d9accd43709cb0d8f6e50aa54a5f3bdd618be23cf73ef736ed0ef7524b0d14d5bef8c8aec1cf1ed3e1c38a808b35e61a44078127c7cb3a8fd7addfa50fcf3ff3bc6d6bc355d5436fe9b71eb44f7fd

      COUNT = 0
      EntropyInput = d3cc4d1acf3dde0c4bd2290d262337042dc632948223d3a2eaab87da44295fbd
      Nonce = 0109b0e729f457328aa18569a9224921
      PersonalizationString =
      AdditionalInput = 3c311848183c9a212a26f27f8c6647e40375e466a0857cc39c4e47575d53f1f6
      AdditionalInput = fcb9abd19ccfbccef88c9c39bfb3dd7b1c12266c9808992e305bc3cff566e4e4
      ReturnedBits = 9c7b758b212cd0fcecd5daa489821712e3cdea4467b560ef5ddc24ab47749a1f1ffdbbb118f4e62fcfca3371b8fbfc5b0646b83e06bfbbab5fac30ea09ea2bc76f1ea568c9be0444b2cc90517b20ca825f2d0eccd88e7175538b85d90ab390183ca6395535d34473af6b5a5b88f5a59ee7561573337ea819da0dcc3573a22974

      COUNT = 1
      EntropyInput = f97a3cfd91faa046b9e61b9493d436c4931f604b22f1081521b3419151e8ff06
      Nonce = 11f3a7d43595357d58120bd1e2dd8aed
      PersonalizationString =
      AdditionalInput = 517289afe444a0fe5ed1a41dbbb5eb17150079bdd31e29cf2ff30034d8268e3b
      AdditionalInput = 88028d29ef80b4e6f0fe12f91d7449fe75062682e89c571440c0c9b52c42a6e0
      ReturnedBits = c6871cff0824fe55ea7689a52229886730450e5d362da5bf590dcf9acd67fed4cb32107df5d03969a66b1f6494fdf5d63d5b4d0d34ea7399a07d0116126d0d518c7c55ba46e12f62efc8fe28a51c9d428e6d371d7397ab319fc73ded4722e5b4f30004032a6128df5e7497ecf82ca7b0a50e867ef6728a4f509a8c859087039c

      COUNT = 2
      EntropyInput = 0f2f23d64f481cabec7abb01db3aabf125c3173a044b9bf26844300b69dcac8b
      Nonce = 9a5ae13232b43aa19cfe8d7958b4b590
      PersonalizationString =
      AdditionalInput = ec4c7a62acab73385f567da10e892ff395a0929f959231a5628188ce0c26e818
      AdditionalInput = 6b97b8c6b6bb8935e676c410c17caa8042aa3145f856d0a32b641e4ae5298648
      ReturnedBits = 7480a361058bd9afa3db82c9d7586e42269102013f6ec5c269b6d05f17987847748684766b44918fd4b65e1648622fc0e0954178b0279dfc9fa99b66c6f53e51c4860131e9e0644287a4afe4ca8e480417e070db68008a97c3397e4b320b5d1a1d7e1d18a95cfedd7d1e74997052bf649d132deb9ec53aae7dafdab55e6dae93

      COUNT = 3
      EntropyInput = 53c56660c78481be9c63284e005fcc14fbc7fb27732c9bf1366d01a426765a31
      Nonce = dc7a14d0eb5b0b3534e717a0b3c64614
      PersonalizationString =
      AdditionalInput = 3aa848706ecb877f5bedf4ffc332d57c22e08747a47e75cff6f0fd1316861c95
      AdditionalInput = 9a401afa739b8f752fddacd291e0b854f5eff4a55b515e20cb319852189d3722
      ReturnedBits = 5c0eb420e0bf41ce9323e815310e4e8303cd677a8a8b023f31f0d79f0ca15aeb636099a369fd074d69889865eac1b72ab3cbfebdb8cf460b00072802e2ec648b1349a5303be4ccaadd729f1a9ea17482fd026aaeb93f1602bc1404b9853adde40d6c34b844cf148bc088941ecfc1642c8c0b9778e45f3b07e06e21ee2c9e0300

      COUNT = 4
      EntropyInput = f63c804404902db334c54bb298fc271a21d7acd9f770278e089775710bf4fdd7
      Nonce = 3e45009ea9cb2a36ba1aa4bf39178200
      PersonalizationString =
      AdditionalInput = d165a13dc8cc43f3f0952c3f5d3de4136954d983683d4a3e6d2dc4c89bf23423
      AdditionalInput = 75106bc86d0336df85097f6af8e80e2da59046a03fa65b06706b8bbc7ffc6785
      ReturnedBits = 6363139bba32c22a0f5cd23ca6d437b5669b7d432f786b8af445471bee0b2d24c9d5f2f93717cbe00d1f010cc3b9c515fc9f7336d53d4d26ba5c0d76a90186663c8582eb739c7b6578a3328bf68dc2cec2cd89b3a90201f6993adcc854df0f5c6974d0f5570765a15fe03dbce28942dd2fd16ba2027e68abac83926969349af8

      COUNT = 5
      EntropyInput = 2aaca9147da66c176615726b69e3e851cc3537f5f279fe7344233d8e44cfc99d
      Nonce = 4e171f080af9a6081bee9f183ac9e340
      PersonalizationString =
      AdditionalInput = d75a2a6eb66c3833e50f5ec3d2e434cf791448d618026d0c360806d120ded669
      AdditionalInput = b643b74c15b37612e6577ed7ca2a4c67a78d560af9eb50a4108fca742e87b8d6
      ReturnedBits = 501dcdc977f4ba856f24eaa4968b374bebb3166b280334cb510232c31ebffde10fa47b7840ef3fe3b77725c2272d3a1d4219baf23e0290c622271edcced58838cf428f0517425d2e19e0d8c89377eecfc378245f283236fafa466c914b99672ceafab369e8889a0c866d8bd639db9fb797254262c6fd44cfa9045ad6340a60ef

      COUNT = 6
      EntropyInput = a2e4cd48a5cf918d6f55942d95fcb4e8465cdc4f77b7c52b6fae5b16a25ca306
      Nonce = bef036716440db6e6d333d9d760b7ca8
      PersonalizationString =
      AdditionalInput = bfa591c7287f3f931168f95e38869441d1f9a11035ad8ea625bb61b9ea17591c
      AdditionalInput = c00c735463bca215adc372cb892b05e939bf669583341c06d4e31d0e5b363a37
      ReturnedBits = e7d136af69926a5421d4266ee0420fd729f2a4f7c295d3c966bdfa05268180b508b8a2852d1b3a06fd2ab3e13c54005123ef319f42d0c6d3a575e6e7e1496cb28aacadbcf83740fba8f35fcee04bb2ed8a51db3d3362b01094a62fb57e33c99a432f29fce6676cffbbcc05107e794e75e44a02d5e6d9d748c5fbff00a0178d65

      COUNT = 7
      EntropyInput = 95a67771cba69011a79776e713145d309edae56fad5fd6d41d83eaff89df6e5e
      Nonce = be5b5164e31ecc51ba6f7c3c5199eb33
      PersonalizationString =
      AdditionalInput = 065f693b229a7c4fd373cd15b3807552dd9bf98c5485cef361949d4e7d774b53
      AdditionalInput = 9afb62406f0e812c4f156d58b19a656c904813c1b4a45a0029ae7f50731f8014
      ReturnedBits = f61b61a6e79a41183e8ed6647899d2dc85cdaf5c3abf5c7f3bf37685946dc28f4923dc842f2d4326bd6ce0d50a84cb3ba869d72a36e246910eba6512ba36cd7ed3a5437c9245b00a344308c792b668b458d3c3e16dee2fbec41867da31084d46d8ec168de2148ef64fc5b72069abf5a6ada1ead2b7146bb793ff1c9c3690fa56

      COUNT = 8
      EntropyInput = a459e1815cbca4514ec8094d5ab2414a557ba6fe10e613c345338d0521e4bf90
      Nonce = 62221392e2552e76cd0d36df6e6068eb
      PersonalizationString =
      AdditionalInput = 0a3642b02b23b3ef62c701a63401124022f5b896de86dab6e6c7451497aa1dcc
      AdditionalInput = c80514865901371c45ba92d9f95d50bb7c9dd1768cb3dfbc45b968da94965c6e
      ReturnedBits = 464e6977b8adaef307c9623e41c357013249c9ffd77f405f3925cebb69f151ce8fbb6a277164002aee7858fc224f6499042aa1e6322deee9a5d133c31d640e12a7487c731ba03ad866a24675badb1d79220c40be689f79c2a0be93cb4dada3e0eac4ab140cb91998b6f11953e68f2319b050c40f71c34de9905ae41b2de1c2f6

      COUNT = 9
      EntropyInput = 252c2cad613e002478162861880979ee4e323025eebb6fb2e0aa9f200e28e0a1
      Nonce = d001bc9a8f2c8c242e4369df0c191989
      PersonalizationString =
      AdditionalInput = 9bcfc61cb2bc000034bb3db980eb47c76fb5ecdd40553eff113368d639b947fd
      AdditionalInput = 8b0565c767c2610ee0014582e9fbecb96e173005b60e9581503a6dca5637a26e
      ReturnedBits = e96c15fe8a60692b0a7d67171e0195ff6e1c87aab844221e71700d1bbee75feea695f6a740c9760bbe0e812ecf4061d8f0955bc0195e18c4fd1516ebca50ba6a6db86881737dbab8321707675479b87611db6af2c97ea361a5484555ead454defb1a64335de964fc803d40f3a6f057893d2afc25725754f4f00abc51920743dc

      COUNT = 10
      EntropyInput = 8be0ca6adc8b3870c9d69d6021bc1f1d8eb9e649073d35ee6c5aa0b7e56ad8a5
      Nonce = 9d1265f7d51fdb65377f1e6edd6ae0e4
      PersonalizationString =
      AdditionalInput = da86167ac997c406bb7979f423986a84ec6614d6caa7afc10aff0699a9b2cf7f
      AdditionalInput = e4baa3c555950b53e2bfdba480cb4c94b59381bac1e33947e0c22e838a9534cf
      ReturnedBits = 64384ecc4ea6b458efc227ca697eac5510092265520c0a0d8a0ccf9ed3ca9d58074671188c6a7ad16d0b050cdc072c125d7298d3a31d9f044a9ee40da0089a84fea28cc7f05f1716db952fad29a0e779635cb7a912a959be67be2f0a4170aace2981802e2ff6467e5b46f0ffbff3b42ba5935fd553c82482ac266acf1cd247d7

      COUNT = 11
      EntropyInput = d43a75b6adf26d60322284cb12ac38327792442aa8f040f60a2f331b33ac4a8f
      Nonce = 0682f8b091f811afacaacaec9b04d279
      PersonalizationString =
      AdditionalInput = 7fd3b8f512940da7de5d80199d9a7b42670c04a945775a3dba869546cbb9bc65
      AdditionalInput = 2575db20bc7aafc2a90a5dabab760db851d754777bc9f05616af1858b24ff3da
      ReturnedBits = 0da7a8dc73c163014bf0841913d3067806456bbca6d5de92b85534c6545467313648d71ef17c923d090dc92cff8d4d1a9a2bb63e001dc2e8ab1a597999be3d6cf70ff63fee9985801395fbd4f4990430c4259fcae4fa1fcd73dc3187ccc102d04af7c07532885e5a226fc42809c48f22eecf4f6ab996ae4fcb144786957d9f41

      COUNT = 12
      EntropyInput = 64352f236af5d32067a529a8fd05ba00a338c9de306371a0b00c36e610a48d18
      Nonce = df99ed2c7608c870624b962a5dc68acd
      PersonalizationString =
      AdditionalInput = da416335e7aaf60cf3d06fb438735ce796aad09034f8969c8f8c3f81e32fef24
      AdditionalInput = a28c07c21a2297311adf172c19e83ca0a87731bdffb80548978d2d1cd82cf8a3
      ReturnedBits = 132b9f25868729e3853d3c51f99a3b5fae6d4204bea70890daf62e042b776a526c8fb831b80a6d5d3f153237df1fd39b6fd9137963f5516d9cdd4e3f9195c46e9972c15d3edc6606e3368bde1594977fb88d0ca6e6f5f3d057ccadc7d7dab77dfc42658a1e972aa446b20d418286386a52dfc1c714d2ac548713268b0b709729

      COUNT = 13
      EntropyInput = 282f4d2e05a2cd30e9087f5633089389449f04bac11df718c90bb351cd3653a5
      Nonce = 90a7daf3c0de9ea286081efc4a684dfb
      PersonalizationString =
      AdditionalInput = 2630b4ccc7271cc379cb580b0aaede3d3aa8c1c7ba002cf791f0752c3d739007
      AdditionalInput = c31d69de499f1017be44e3d4fa77ecebc6a9b9934749fcf136f267b29115d2cc
      ReturnedBits = c899094520e0197c37b91dd50778e20a5b950decfb308d39f1db709447ae48f6101d9abe63a783fbb830eec1d359a5f61a2013728966d349213ee96382614aa4135058a967627183810c6622a2158cababe3b8ab99169c89e362108bf5955b4ffc47440f87e4bad0d36bc738e737e072e64d8842e7619f1be0af1141f05afe2d

      COUNT = 14
      EntropyInput = 13c752b9e745ce77bbc7c0dbda982313d3fe66f903e83ebd8dbe4ff0c11380e9
      Nonce = f1a533095d6174164bd7c82532464ae7
      PersonalizationString =
      AdditionalInput = 4f53db89b9ba7fc00767bc751fb8f3c103fe0f76acd6d5c7891ab15b2b7cf67c
      AdditionalInput = 582c2a7d34679088cca6bd28723c99aac07db46c332dc0153d1673256903b446
      ReturnedBits = 6311f4c0c4cd1f86bd48349abb9eb930d4f63df5e5f7217d1d1b91a71d8a6938b0ad2b3e897bd7e3d8703db125fab30e03464fad41e5ddf5bf9aeeb5161b244468cfb26a9d956931a5412c97d64188b0da1bd907819c686f39af82e91cfeef0cbffb5d1e229e383bed26d06412988640706815a6e820796876f416653e464961
    */}.toString().replace(/^function.*\/\*|\*\/}/g, '').split(/\n\n/g);

    vector.forEach(function(item) {
      var lines = item.split(/\n/g);
      var opt = null;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        var match = line.match(
          /(COUNT|Entropy|Non|Per|Add|Ret)\w*\s*=\s*([\w\d]*)/
        );
        if (!match)
          continue;

        var key = match[1];
        var value = match[2] || null;
        if (key === 'COUNT') {
          opt = {
            name: value,
            entropy: null,
            nonce: null,
            pers: null,
            add: [],
            expected: null
          };
        } else if (key === 'Entropy') {
          opt.entropy = value;
        } else if (key === 'Non') {
          opt.nonce = value;
        } else if (key === 'Per') {
          opt.pers = value;
        } else if (key === 'Add') {
          if (value && opt.add.length === 0)
            opt.name += ' with additional data';
          opt.add.push(value);
        } else if (key === 'Ret') {
          opt.expected = value;
          test(opt);
          opt = null;
        }
      }
    });
  });
});

<script setup>
/* eslint-disable vue/no-v-html */
import LazyLoad from "vanilla-lazyload";
const props = defineProps({
  v_value: {
    type: String,
    default: '',
  },
  v_path: {
    type: String,
    default: 'input',
  },
})

const imageText = ref('&#x1F4F7;');
const fileName = ref(props.v_value.value);
const videoElem = useTemplateRef('videoPreview');
const videoClass = ref('');
const lastBlobURL = ref(null);
const presentationFileElem = useTemplateRef("presentationFile");
const width = ref(null);

let presentationImage = null;
function image() {
  if (!presentationImage) {
    presentationImage = new PresentationImage();
    presentationImage.video = videoElem.value;
    return presentationImage.startRecording().then((success) => {
      videoClass.value = 'pres-show-video';
      videoElem.value.srcObject = presentationImage.mediaStream;
      if (success) {
        imageText.value = '&#x2B24;';
      } else {
        toast.error('Failed to start recording.');
      }
    });
  } else {
    return presentationImage.createImageBlob().then((blob) => {
      if (blob) {
        const dateStr = getIsoDateFileName();
        fileName.value = `camera-${dateStr}.png`;
        const file = new File([blob], fileName.value);
        return uploadFile(file, props.v_path);
      }
    }).then(() => {
      lastBlobURL.value = presentationImage.getBlobURL();
      const success = presentationImage.stopRecording();
      if (success) {
        imageText.value = '&#x1F4F7;';
      } else {
        toast.error('failed to stop recording');
      }
    }).then(() => {
      dispatchLoadFiles();
      presentationImage = null;
      videoClass.value = '';
    });
  }
}

function changePreview(event) {
    lastBlobURL.value = event.detail.url;
}

let lazyLoadInstance;

async function changeFiles() {
  resetLazyLoad(presentationFileElem.value);
  lazyLoadInstance.update();
}

onMounted(async () => {
  lazyLoadInstance = new LazyLoad({ });
  lazyLoadInstance.update();
  setupWidth();
});

function setupWidth() {
  const w = presentationFileElem.value.querySelector('.lazy')?.width;
  if (w && w !== width.value) {
    width.value = w;
  }
}

async function showTab(show) {
  if (show) {
    await nextTick();
    if (presentationFileElem.value) {
      setupWidth();
    }
  }
};


// Show a blank.gif as default
//const defaultoptions=[{file:'blank.gif',url:'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}];
// 1024
const blank1024=blankSVG(1024);
//const blank1024='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221024%22%20height%3D%221024%22%2F%3E';
//const blank1024='data:image/gif;base64,R0lGODlhAAQABIAAAAAAAAAAACH5BAEKAAEALAAAAAAABAAEAAL+jI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6zvf+DwwKh8Si8YhMKpfMpvMJjUqn1Kr1is1qt9yu9wsOi8fksvmMTqvX7Lb7DY/L5/S6/Y7P6/f8vv8PGCg4SFhoeIiYqLjI2Oj4CBkpOUlZaXmJmam5ydnp+QkaKjpKWmp6ipqqusra6voKGys7S1tre4ubq7vL2+v7CxwsPExcbHyMnKy8zNzs/AwdLT1NXW19jZ2tvc3d7f0NHi4+Tl5ufo6err7O3u7+Dh8vP09fb3+Pn6+/z9/v/w8woMCBBAsaPIgwocKFDBs6fAgxosSJFCtavIgxo8b+jRw7evwIMqTIkSRLmjyJMqXKlSxbunwJM6bMmTRr2ryJM6fOnTx7+vwJNKjQoUSLGj2KNKnSpUybOn0KNarUqVSrWr2KNavWrVy7ev0KNqzYsWTLmj2LNq3atWzbun0LN67cuXTr2r2LN6/evXz7+v0LOLDgwYQLGz6MOLHixYwbO34MObLkyZQrW76MObPmzZw7e/4MOrTo0aRLmz6NOrXq1axbu34NO7bs2bRr276NO7fu3bx7+/4NPLjw4cSLGz+OPLny5cybO38OPbr06dSrW7+OPbv27dy7e/8OPrz48eTLmz+PPr369ezbu38PP778+fTr27+PP7/+/fz++/v/D2CAAg5IYIEGHohgggouyGCDDj4IYYQSTkhhhRZeiGGGGm7IYYcefghiiCKOSGKJJp6IYooqrshiiy6+CGOMMs5IY4023ohjjjruyGOPPv4IZJBCDklkkUYeiWSSSi7JZJNOPglllFJOSWWVVl6JZZZabslll15+CWaYYo5JZplmnolmmmquyWabbr4JZ5xyzklnnXbeiWeeeu7JZ59+/glooIIOSmihhh6KaKKKLspoo44+Cmmkkk5KaaWWXopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHov+bLLKLstss84+C2200k5LbbXWXottttpuy2233n4Lbrjijktuueaei2666q7LbrvuvgtvvPLOS2+99t6Lb7767stvv/7+C3DAAg9McMEGH4xwwgovzHDDDj8MccQST0xxxRZfjHHGGm/McccefwxyyCKPTHLJJp+Mcsoqr8xyyy6/DHPMMs9Mc80234xzzjrvzHPPPv8MdNBCD0100UYfjXTSSi/NdNNOPw111FJPTXXVVl+NddZab811115/DXbYYo9Ndtlmn4122mqvzXbbbr8Nd9xyz0133XbfjXfeeu/Nd99+/w144IIPTnjhhh+OeOKKL854444/Dnnkkk/+Tnnlll+Oeeaab855555/Dnrooo9Oeummn4566qqvznrrrr8Oe+yyz0577bbfjnvuuu/Oe+++/w588MIPT3zxxh+PfPLKL898884/D3300k9PffXWX4999tpvz3333n8Pfvjij09++eafj3766q/Pfvvuvw9//PLPT3/99t+Pf/76789///7/D8AACnCABCygAQ+IwAQqcIEMbKADHwjBCEpwghSsoAUviMEManCDHOygBz8IwhCKcIQkLKEJT4jCFKpwhSxsoQtfCMMYynCGNKyhDW+IwxzqcIc87KEPfwjEIApxiEQsohGPiMQkKnGJTGyiE58IxShKcYpUrKL+Fa+IxSxqcYtc7KIXvwjGMIpxjGQsoxnPiMY0qnGNbGyjG98IxzjKcY50rKMd74jHPOpxj3zsox//CMhACnKQhCykIQ+JyEQqcpGMbKQjHwnJSEpykpSspCUviclManKTnOykJz8JylCKcpSkLKUpT4nKVKpylaxspStfCctYynKWtKylLW+Jy1zqcpe87KUvfwnMYApzmMQspjGPicxkKnOZzGymM58JzWhKc5rUrKY1r4nNbGpzm9zspje/Cc5winOc5CynOc+JznSqc53sbKc73wnPeMpznvSspz3vic986nOf/OynP/8J0IAKdKAELahBD4rQhCp0oQxtqEPbHwrRiEp0ohStqEUvitGManSjHO2oRz8K0pCKdKQkLalJT4rSlKp0pSxtqUtfCtOYynSmNK2pTW+K05zqdKc87alPfwrUoAp1qEQtqlGPitSkKnWpTG2qU58K1ahKdapUrapVr4rVrGp1q1ztqle/CtawinWsZC2rWc+K1rSqda1sbatb3wrXuMp1rnStq13vite86nWvfO2rX/8K2MAKdrCELaxhD4vYxCp2sYxtrGMfC9nISnaylK2sZS+L2cxqdrOc7axnPwva0Ip2tKQtrWlPi9rUqna1uCsAADs=';

const defaultoptions=[{file:'blank.svg',url:blank1024}];
// 512
//const defaultoptions=[{file:'blank.gif',url:'data:image/gif;base64,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vbr169iza9/Ovbv37+DDi/8fT768+fPo06tfz769+/fw48ufT7++/fv48+vfz7+///8ABijggAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTUEYp5ZRUVmnllVhmqeWWXHbp5ZdghinmmGSWaeaZaKap5ppstunmm3DGKeecdNZp55145qnnnnz26eefgAYq6KCEFmrooYgmquiijDbq6KOQRirppJRWaumlmGaq6aacdurpp6CGKuqopJZq6qmopqrqqqy26uqrsMb/KuustNZq66245qrrrrz26uuvwAYr7LDEFmvsscgmq+yyzDbr7LPQRivttNRWa+212Gar7bbcduvtt+CGK+645JZr7rnopqvuuuy26+678MYr77z01mvvvfjmq+++/Pbr778AByzwwAQXbPDBCCes8MIMN+zwwxBHLPHEFFds8cUYZ6zxxhx37PHHIIcs8sgkl2zyySinrPLKLLfs8sswxyzzzDTXbPPNOOes88489+zzz0AHLfTQRBdt9NFIJ6300kw37fTTUEct9dRUV2311VhnrfXWXHft9ddghy322GSXbfbZaKet9tpst+3223DHLffcdNdt991456333nz3b+3334AHLvjghBdu+OGIJ6744ow37vjjkEcu+eSUV2755ZhnrvnmnHfu+eeghy766KSXbvrpqKeu+uqst+7667DHLvvstNdu++2456777rz37vvvwAcv/PDEF2/88cgnr/zyzDfv/PPQRy/99KIGBAA7'}];

</script>

<template>
  <div ref='presentationFile' class="pres-event-show-tab" @show-tab='showTab'>
    <NodePresentationFile :v_value = "fileName" :v_path="v_path" :drop-down="false" :v_defaultoptions="defaultoptions" v-bind="$attrs">
      <template #item="{ option, index }">
        <!-- blank image should have the lazy class on it for calculating the width. There is no data-src, it is not used -->
        <img v-if="/^data:/.exec(option.url)" class="pres-image-item lazy" :src="option.url" :title="option.file" />
        <img v-else class="pres-image-item lazy" :src="blank1024" :data-src="`${option.url}${ width ? ('&width='+width) : ''}`" :title="option.file" />
      </template>
      <template #buttons>
        <button class="pres-event-change-files pres-event-change-preview pres-button" @click="image" @change-preview="changePreview" @change-files="changeFiles" v-html="imageText"></button>
        <video ref="videoPreview" :class="[videoClass]" class="pres-video-preview" autoplay playsinline></video>
        <img v-if="lastBlobURL" :src="lastBlobURL" class="pres-preview-image" />
      </template>
    </NodePresentationFile>
  </div>
</template>

<style>
body .pres-show-video {
  display: block;
}
.pres-video-preview {
  display: none;
  width: 100%;
}
.pres-preview-image {
  width: 100%;
}
.pres-image-item {
  width: 100%;
  /* aspect-ratio: 1/1; */
  border-radius: 5%;
  border: 3px solid #aaa;

  min-height: 17vw;
  height: 17vw;
  min-width: 17vw;
  width: 17vw;
}
.pres-selected .pres-image-item {
  border: 3px solid #444;
  filter: brightness(70%);
}
</style>

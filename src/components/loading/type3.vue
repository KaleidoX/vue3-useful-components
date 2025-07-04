<template>
  <div class="loader-wrapper">
    <div class="loader"></div>
    <div class="load_title">正在加载系统资源，请耐心等待</div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'LoadingType3'
})
</script>
<style scoped lang="scss">
.loader-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.loader,
.loader:after,
.loader:before {
  display: block;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #7171c6;
}
.loader {
  position: relative;
  left: 50%;
  top: 50%;
  width: 150px;
  height: 150px;
  margin: -75px 0 0 -75px;
  -webkit-animation: spin 2s linear infinite;
  -ms-animation: spin 2s linear infinite;
  -moz-animation: spin 2s linear infinite;
  -o-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}
.loader:before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  -webkit-animation: spin 3s linear infinite;
  -moz-animation: spin 3s linear infinite;
  -o-animation: spin 3s linear infinite;
  -ms-animation: spin 3s linear infinite;
  animation: spin 3s linear infinite;
}
.loader:after {
  content: '';
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  -moz-animation: spin 1.5s linear infinite;
  -o-animation: spin 1.5s linear infinite;
  -ms-animation: spin 1.5s linear infinite;
  -webkit-animation: spin 1.5s linear infinite;
  animation: spin 1.5s linear infinite;
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0);
    -ms-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0);
    -ms-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
.loader-wrapper .load_title {
  color: #7171c6;
  font-size: 19px;
  width: 100%;
  text-align: center;
  position: absolute;
  top: calc(50% + 180px);
  opacity: 1;
  line-height: 30px;
}
</style>

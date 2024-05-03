// import { Pipeline, pipeline } from "@xenova/transformers";


// export const translate = async () => {
//   const translator:any = await pipeline("translation", "Xenova/m2m100_418M");
   
//     const output = await translator(['hi'], {
//       src_lang: "fr", // Chinese
//       tgt_lang: "en", // English
//     });

//     return output
// }

export const json = (param: any): any => {
    return JSON.stringify(
      param,
      (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    );
  };
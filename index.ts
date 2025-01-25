import OpenAI, { NotFoundError } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import * as fs from "fs";
import createRecipe from "./recipes/createRecipe.js";
import { RecipeZodel } from "./Recipe.js";
import sequelize from "./models/connection.js";
import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import Recipe from "./models/Recipe.js";
import https from "https";
import { readFile } from "node:fs/promises";
import axios from "axios";
import crypto from "crypto";

// Sync db tables
const syncAllTables = async () => {
  await sequelize.sync();
};

await syncAllTables();
const openai = new OpenAI();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const recipeCategories = [
  "Vegan",
  "Vegetarian",
  "Pork",
  "Beef",
  "Chicken",
  "Seafood",
  "Comfort Food",
  "Healthy",
  "Gluten-Free",
  "Dairy-Free",
  "Low-Carb",
  "Keto",
  "Paleo",
  "Desserts",
  "Snacks",
  "Appetizers",
  "Soups",
  "Salads",
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
  "Quick & Easy",
  "Slow Cooker",
  "Grilling",
  "Holiday",
  "International",
  "Spicy",
  "Low-Sodium",
  "High-Protein",
  "Kid-Friendly",
  "Baking",
  "Air Fryer",
  "Meal Prep",
  "One-Pot Meals",
  "Gluten-Free Desserts",
  "Vegetarian Comfort Food",
  "Vegan Desserts",
  "Sheet Pan Meals",
  "Seasonal",
  "Fusion Cuisine",
  "Budget-Friendly",
  "Family-Style",
  "Romantic Dinners",
  "Party Foods",
  "Camping Meals",
  "Picnic Recipes",
  "Street Food",
  "Farm-to-Table",
  "Gourmet",
  "Ethnic Cuisine",
  "Festive",
  "BBQ",
  "Low-Fat",
  "High-Fiber",
  "Post-Workout Meals",
  "Five Ingredients or Less",
  "Leftover Makeovers",
  "Microwave Recipes",
  "Instant Pot Recipes",
  "Regional Specialties",
  "Casseroles",
  "Stuffed Recipes",
];
const recipeRegions = [
  "French",
  "Italian",
  "Japanese",
  "Chinese",
  "Polynesian",
  "Mexican",
  "Indian",
  "Thai",
  "Greek",
  "Spanish",
  "Korean",
  "Vietnamese",
  "Middle Eastern",
  "Caribbean",
  "African",
  "Moroccan",
  "Ethiopian",
  "Brazilian",
  "Peruvian",
  "Argentinian",
  "Cajun",
  "Creole",
  "German",
  "Russian",
  "Scandinavian",
  "Turkish",
  "Filipino",
  "Hawaiian",
  "Malaysian",
  "Singaporean",
  "Australian",
  "British",
  "Irish",
  "Pakistani",
  "Afghan",
  "Lebanese",
  "Syrian",
  "Israeli",
  "Cuban",
  "Chilean",
  "Portuguese",
  "Swiss",
  "Hungarian",
  "Polish",
  "Ukrainian",
  "Persian",
  "Tibetan",
  "Mongolian",
  "Indonesian",
  "Burmese",
  "Bangladeshi",
];
const attributes: string[] = [
  "name",
  "difficulty",
  "length",
  "image",
  "video",
  "id",
];

const s3Client = new S3Client({
  region: "us-west-1",
});

async function createRecipeBatch() {
  console.log(`Creating new recipe batch...`);

  const category =
    recipeCategories[Math.round(Math.random() * recipeCategories.length)];
  const region =
    recipeRegions[Math.round(Math.random() * recipeRegions.length)];
  const now = new Date();
  const fileName = `batch-${region}-${category}-${now.toString()}.jsonl`;
  //   fs.writeFileSync(fileName, JSON.stringify(batchJsonl));
  const batchJsonl = {
    custom_id: "recipe",
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Create a ${category} recipe from ${region} following the provided recipe schema.
            The recipe should adhere to the constraints of ${category} and originate from ${region}.
            If such a recipe does not exist, create one.`,
        },
      ],
      max_tokens: 10560,
      response_format: zodResponseFormat(RecipeZodel, "recipe"),
    },
  };
  for (let index = 0; index < 1000; index++) {
    const category =
      recipeCategories[Math.round(Math.random() * recipeCategories.length)];
    const region =
      recipeRegions[Math.round(Math.random() * recipeRegions.length)];
    fs.appendFile(
      fileName,
      JSON.stringify({
        custom_id: `recipe-${index}`,
        method: "POST",
        url: "/v1/chat/completions",
        body: {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Create a ${category} recipe from ${region} following the provided recipe schema.
                The recipe should adhere to the constraints of ${category} and originate from ${region}.
                If such a recipe does not exist, create one.`,
            },
          ],
          max_tokens: 10560,
          response_format: zodResponseFormat(RecipeZodel, "recipe"),
        },
      })
        .replace(/\\n/g, "")
        .concat("\n"),
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
    // batchJsonl.body.messages.push({
    //   role: "system",
    //   content: `Create a ${category} recipe from ${region} following the provided recipe schema.
    //       The recipe should adhere to the constraints of ${category} and originate from ${region}.
    //       If such a recipe does not exist, create one.`,
    // });
  }

  const file = await openai.files.create({
    file: fs.createReadStream(fileName),
    purpose: "batch",
  });
  fs.unlink(fileName, (err) => {
    err ? console.log(err) : null;
  });

  console.log(`Creating batch request...`);
  const batch = await openai.batches.create({
    input_file_id: file.id,
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
  });
}

async function processCompletedBatches() {
  console.log(`Processing completed batches`);
  const allFiles = await openai.files.list({ limit: 100 });
  allFiles.data.map(async (file) => {
    try {
      if (file.purpose === "batch_output") {
        const fileResponse = await openai.files.content(file.id);
        const fileContents = (await fileResponse.text()).split("\n");
        fileContents.map(async (recipe) => {
          if (typeof recipe === "string") {
            const fileJson = await JSON.parse(recipe);
            await fileJson.response.body.choices.map(async (choice: any) => {
              const recipe = RecipeZodel.parse(
                await JSON.parse(choice.message.content)
              );
              await createRecipe(recipe);
            });
          }
        });
      }
      await openai.files.del(file.id);
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        console.log(error);
      }
    }

    // const recipe = RecipeZodel.parse(
    //   await JSON.parse(
    //     await JSON.parse(fileContents).response.body.choices[0].message
    //       .content
    //   )
    // );
    // await createRecipe(recipe);
    // await openai.files.del(batch.output_file_id!).catch((NotFoundError) => {
    //   console.log(`FNF: ${NotFoundError}`);
    // });
    // await openai.files.del(batch.input_file_id).catch((NotFoundError) => {
    //   console.log(`FNF: ${NotFoundError}`);
    // });
    // const image = await openai.images.generate({
    //   model: "dall-e-2",
    //   prompt: `A realistic photograph of ${recipe.title} freshly prepared.`,
    //   n: 1,
    //   size: "512x512",
    //   response_format: "url",
    // });
  });
  //   deleteBatchFiles();
}
async function deleteBatchFiles() {
  let allBatches = await openai.batches.list({ limit: 100 });
  let status = true;
  while (status) {
    allBatches.data.map(async (batch) => {
      if (batch.status === "completed") {
        await openai.files.del(batch.output_file_id!).catch((NotFoundError) => {
          console.log(`FNF: ${NotFoundError}`);
        });
        await openai.files.del(batch.input_file_id).catch((NotFoundError) => {
          console.log(`FNF: ${NotFoundError}`);
        });
      }
    });
    if (allBatches.data.length === 100) {
      allBatches = await openai.batches.list({
        limit: 100,
        after: allBatches.data[99].id,
      });
    } else {
      status = false;
    }
  }
}

async function generateMissingImages() {
  console.log(`Generating missing images...`);
  const recipe = await Recipe.findOne({
    where: {
      image: 'undefined'
    }
  });
  console.log(`Processing ${recipe?.dataValues.title}`)
  const filename = `${crypto.createHash("md5").update(recipe?.dataValues.title).digest("hex")}.png`;
  try {
    const image = await openai.images.generate({
      model: "dall-e-2",
      prompt: `A realistic photograph of ${
        recipe!.dataValues.title
      } freshly prepared and professionally presented.`,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });
    await retrieveAndStoreImage(
      image.data[0].url!,
      `${recipe?.dataValues.title}`,
      filename
    );
    console.log(`Generated image and updated database.  Deleting local file and sleeping for 10 seconds.`);
    fs.unlink(`./${filename}`, (err) => {if (err){console.log(err)}})
    await sleep(10000);
    return Promise.resolve(true);
  } catch (error: any) {
    if (error.status === 400){
      if (error.error.code === 'billing_hard_limit_reached' ){
        console.log(`Billing limit reached.`)
        return Promise.reject(false)
      }
      await Recipe.destroy({
        where: {
          id: recipe!.dataValues.id
        }
      })
      return Promise.resolve(true)
    }
    if (error.status === 429){
      console.log(`Hit rate limit.  Sleeping for 1 min.`)
      await sleep(60000)
    }
    return Promise.resolve(false)
  }
}

async function retrieveAndStoreImage(
  uri: string,
  recipeTitle: string,
  filename: string
) {
  try {
    const response = await axios.get(uri, { responseType: "stream" });
    await response.data.pipe(fs.createWriteStream(`${filename}`));
    console.log("File downloading. Sleeping for a hard 10 seconds because I apparently suck at making this synchronous and I'm tired of dealing with it.");
    await sleep(10000);
  } catch (error) {
    console.error("Error downloading file:", error);
  }

  // Create bucket
  const bucketConfig = {
    Bucket: "recipebuddy-images", // required
  };
  const imageConfig = new PutObjectCommand({
    Bucket: bucketConfig.Bucket,
    Key: filename,
    Body: fs.readFileSync(`./${filename}`),
  });
  try {
    const response = await s3Client.send(imageConfig);
    if (response.$metadata.httpStatusCode === 200) {
      updateImageUrl(recipeTitle, `https://recipebuddy-images.s3.us-west-1.amazonaws.com/${filename}`);
    }
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "EntityTooLarge"
    ) {
      console.error(
        `Error from S3 while uploading object to ${bucketConfig.Bucket}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${bucketConfig.Bucket}.  ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
}

async function updateImageUrl(recipeTitle: string, url: string) {
  const res = await Recipe.findOne({
    where: {
      title: recipeTitle,
    },
  });
  if (res !== null) {
    res.set({
      image: url,
    });
  }
  res?.save();
}

while (true) {
  await processCompletedBatches();
  //   await createRecipeBatch();
  await generateMissingImages();
  // console.log(`Sleeping for 5 mins`);
  // await sleep(300000);
}

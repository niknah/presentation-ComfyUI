export default async function(userId) {
  if (!hasDB()) {
    throw createError({
      statusCode: 500,
      statusMessage: "No DB",
      data: { ok: false  }
    });
  }
  // login and check all
  const historyURL = `${comfyUrl()}/api/history`;

  const historyResp = await fetchComfy(historyURL);
  if (historyResp.status != 200) {
    throw new Error("History error: " + historyResp.text());
  }
  const historyObj = await historyResp.json();

  const historyPromptIds = Object.keys(historyObj);

  const queueURL = `${comfyUrl()}/api/queue`;
  const queueResp = await fetchComfy(queueURL);
  if (queueResp.status != 200) {
    throw new Error("Queue error: " + queueResp.text());
  }
  const queueObj = await queueResp.json();

  const queuePromptIds = {};
  function addQueuePromptIds(arr) {
    for (const queue of arr) {
      queuePromptIds[queue[1]] = true;
    }
  }
  addQueuePromptIds(queueObj.queue_running);
  addQueuePromptIds(queueObj.queue_pending);

  const promptDB = new PromptDB();
  return await promptDB.exec([], async () => {
    const promptsObj = await promptDB.getPrompts(userId);
    const prompt_infos = promptsObj?.prompt_infos || [];
    const prompt_infos_str = JSON.stringify(prompt_infos);
    const userQueuePromptIds = {};
    const expireTime = new Date().getTime() - (60000*60*24);
    for(const promptInfo of prompt_infos) {
      const promptId = promptInfo.prompt_id;

      let toKeep = true;
      if (!historyPromptIds[promptId]) {
        promptInfo.inHistory = false;
      }

      if (!queuePromptIds[promptId]) {
        promptInfo.inQueue = false;
      }

      if (promptInfo.inQueue === false && promptInfo.inHistory === false) {
        // not in queue or history
        if (!promptInfo.removedTime) {
          promptInfo.removedTime = new Date().getTime();
        } else if(promptInfo.removedTime < expireTime) {
          toKeep = false;
        }
      }
    
      if (toKeep) {
        userQueuePromptIds[promptId] = promptInfo;
      }
    }

    let queueAmount = 0;
    Object.values(userQueuePromptIds).forEach((i) => {
      if (i.inQueue !== false) {
        queueAmount += i.price;
      }
    });

    const sortedPromptIds = Object.keys(userQueuePromptIds).sort();
    const sortedPromptValues = [];
    for(const promptId of sortedPromptIds) {
      sortedPromptValues.push(userQueuePromptIds[promptId]);
    }
    const sortedPromptValuesStr = JSON.stringify(sortedPromptValues);

    if (sortedPromptValuesStr !== prompt_infos_str) {
      await promptDB.setPromptInfos(
        userId,
        sortedPromptValues
      );
    }

    return { ok: true, queueAmount, promptIds: userQueuePromptIds};
  });
}

/*
get history. check if prompt_id is ours and has been done.  Update


http://localhost:8188/api/queue
queue_running: [
  []
]
queue_pending: []

{
    "queue_running": [
        [1, "6f6051c8-b3af-42cd-8efd-47d411c883f1", {
                "4": {
                    "inputs": {
                        "clip_name1": "t5\\google_t5-v1_1-xxl_encoderonly-fp8_e4m3fn.safetensors",
                        "clip_name2": "clip_l.safetensors",
                        "type": "flux",
                        "device": "default"
                    },
                    "class_type": "DualCLIPLoader",
                    "_meta": {
                        "title": "DualCLIPLoader"
                    }
                },
                "6": {
                    "inputs": {
                        "width": 512,
                        "height": 512,
                        "batch_size": 1
                    },
                    "class_type": "EmptyLatentImage",
                    "_meta": {
                        "title": "IMAGE SIZE"
                    }
                },
                "7": {
                    "inputs": {
                        "samples": ["52", 0],
                        "vae": ["8", 0]
                    },
                    "class_type": "VAEDecode",
                    "_meta": {
                        "title": "VAE Decode"
                    }
                },
                "8": {
                    "inputs": {
                        "vae_name": "FLUX1\\ae.safetensors"
                    },
                    "class_type": "VAELoader",
                    "_meta": {
                        "title": "Load VAE"
                    }
                },
                "24": {
                    "inputs": {
                        "unet_name": "FLUX1\\flux1-dev-Q8_0.gguf"
                    },
                    "class_type": "UnetLoaderGGUF",
                    "_meta": {
                        "title": "Unet Loader (GGUF)"
                    }
                },
                "29": {
                    "inputs": {
                        "text": "",
                        "clip": ["4", 0]
                    },
                    "class_type": "CLIPTextEncode",
                    "_meta": {
                        "title": "CLIP Text Encode (Prompt)"
                    }
                },
                "44": {
                    "inputs": {
                        "text": "a frightened woman wearing a tight business dress, full make up.  A group of street bums approaching her in the background.",
                        "clip": ["4", 0]
                    },
                    "class_type": "CLIPTextEncode",
                    "_meta": {
                        "title": "CLIP Text Encode (Prompt)"
                    }
                },
                "46": {
                    "inputs": {
                        "guidance": 4.0,
                        "conditioning": ["44", 0]
                    },
                    "class_type": "FluxGuidance",
                    "_meta": {
                        "title": "FluxGuidance"
                    }
                },
                "52": {
                    "inputs": {
                        "seed": 376953365930710,
                        "steps": 30,
                        "cfg": 1.0,
                        "sampler_name": "euler",
                        "scheduler": "normal",
                        "denoise": 1.0,
                        "model": ["58", 0],
                        "positive": ["46", 0],
                        "negative": ["29", 0],
                        "latent_image": ["6", 0]
                    },
                    "class_type": "KSampler",
                    "_meta": {
                        "title": "KSampler"
                    }
                },
                "58": {
                    "inputs": {
                        "lora_01": "None",
                        "strength_01": 0.88,
                        "lora_02": "None",
                        "strength_02": 0.7000000000000001,
                        "lora_03": "None",
                        "strength_03": 1.0,
                        "lora_04": "None",
                        "strength_04": 1.0,
                        "model": ["24", 0],
                        "clip": ["4", 0]
                    },
                    "class_type": "Lora Loader Stack (rgthree)",
                    "_meta": {
                        "title": "Lora Loader Stack (rgthree)"
                    }
                },
                "88": {
                    "inputs": {
                        "images": ["7", 0]
                    },
                    "class_type": "PreviewImage",
                    "_meta": {
                        "title": "Preview Image"
                    }
                },
                "95": {
                    "inputs": {
                        "images": ["7", 0]
                    },
                    "class_type": "PreviewImage",
                    "_meta": {
                        "title": "Preview Image"
                    }
                }
            }, {
                "extra_pnginfo": {
                    "workflow": {
                        "id": "4079f673-21df-4447-9c22-b6f1ec78b573",
                        "revision": 0,
                        "last_node_id": 95,
                        "last_link_id": 164,
                        "nodes": [{
                            "id": 29,
                            "type": "CLIPTextEncode",
                            "pos": [188.91268920898438, 1105.5902099609375],
                            "size": [400, 200],
                            "flags": {
                                "collapsed": false
                            },
                            "order": 7,
                            "mode": 0,
                            "inputs": [{
                                "name": "clip",
                                "type": "CLIP",
                                "link": 147
                            }],
                            "outputs": [{
                                "name": "CONDITIONING",
                                "type": "CONDITIONING",
                                "slot_index": 0,
                                "links": [148]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "CLIPTextEncode"
                            },
                            "widgets_values": [""],
                            "color": "#322",
                            "bgcolor": "#533"
                        }, {
                            "id": 52,
                            "type": "KSampler",
                            "pos": [1015.4898681640625, 388],
                            "size": [315, 262],
                            "flags": {},
                            "order": 10,
                            "mode": 0,
                            "inputs": [{
                                "name": "model",
                                "type": "MODEL",
                                "link": 102
                            }, {
                                "name": "positive",
                                "type": "CONDITIONING",
                                "link": 149
                            }, {
                                "name": "negative",
                                "type": "CONDITIONING",
                                "link": 148
                            }, {
                                "name": "latent_image",
                                "type": "LATENT",
                                "link": 90
                            }],
                            "outputs": [{
                                "name": "LATENT",
                                "type": "LATENT",
                                "slot_index": 0,
                                "links": [93]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "KSampler"
                            },
                            "widgets_values": [376953365930710, "randomize", 30, 1, "euler", "normal", 1]
                        }, {
                            "id": 46,
                            "type": "FluxGuidance",
                            "pos": [1198.7039794921875, 844.0071411132812],
                            "size": [317.4000244140625, 58],
                            "flags": {
                                "collapsed": false
                            },
                            "order": 9,
                            "mode": 0,
                            "inputs": [{
                                "name": "conditioning",
                                "type": "CONDITIONING",
                                "link": 132
                            }],
                            "outputs": [{
                                "name": "CONDITIONING",
                                "type": "CONDITIONING",
                                "slot_index": 0,
                                "links": [149]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "FluxGuidance"
                            },
                            "widgets_values": [4]
                        }, {
                            "id": 58,
                            "type": "Lora Loader Stack (rgthree)",
                            "pos": [209, 388],
                            "size": [356.81488037109375, 272.13201904296875],
                            "flags": {},
                            "order": 8,
                            "mode": 0,
                            "inputs": [{
                                "name": "model",
                                "type": "MODEL",
                                "link": 144
                            }, {
                                "name": "clip",
                                "type": "CLIP",
                                "link": 146
                            }],
                            "outputs": [{
                                "name": "MODEL",
                                "type": "MODEL",
                                "slot_index": 0,
                                "links": [102]
                            }, {
                                "name": "CLIP",
                                "type": "CLIP",
                                "links": null
                            }],
                            "properties": {
                                "cnr_id": "rgthree-comfy",
                                "ver": "f044a9dbb3fc9de55c6244d616d386986add3072",
                                "Node name for S&R": "Lora Loader Stack (rgthree)"
                            },
                            "widgets_values": ["None", 0.88, "None", 0.7000000000000001, "None", 1, "None", 1]
                        }, {
                            "id": 4,
                            "type": "DualCLIPLoader",
                            "pos": [366, 887],
                            "size": [315, 130],
                            "flags": {
                                "collapsed": false
                            },
                            "order": 0,
                            "mode": 0,
                            "inputs": [],
                            "outputs": [{
                                "name": "CLIP",
                                "type": "CLIP",
                                "slot_index": 0,
                                "links": [142, 146, 147]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "DualCLIPLoader"
                            },
                            "widgets_values": ["t5\\google_t5-v1_1-xxl_encoderonly-fp8_e4m3fn.safetensors", "clip_l.safetensors", "flux", "default"]
                        }, {
                            "id": 8,
                            "type": "VAELoader",
                            "pos": [944.8320922851562, 1294.3433837890625],
                            "size": [315, 58],
                            "flags": {
                                "collapsed": false
                            },
                            "order": 1,
                            "mode": 0,
                            "inputs": [],
                            "outputs": [{
                                "name": "VAE",
                                "type": "VAE",
                                "slot_index": 0,
                                "links": [143]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "VAELoader"
                            },
                            "widgets_values": ["FLUX1\\ae.safetensors"]
                        }, {
                            "id": 87,
                            "type": "Note",
                            "pos": [1254.000244140625, 92.60004425048828],
                            "size": [210, 88],
                            "flags": {},
                            "order": 2,
                            "mode": 0,
                            "inputs": [],
                            "outputs": [],
                            "properties": {
                                "text": ""
                            },
                            "widgets_values": ["ENABLE/DISABLE upscaling"],
                            "color": "#432",
                            "bgcolor": "#653"
                        }, {
                            "id": 80,
                            "type": "Reroute",
                            "pos": [1580, 149],
                            "size": [75, 26],
                            "flags": {},
                            "order": 12,
                            "mode": 0,
                            "inputs": [{
                                "name": "",
                                "type": "*",
                                "link": 140
                            }],
                            "outputs": [{
                                "name": "",
                                "type": "IMAGE",
                                "slot_index": 0,
                                "links": [141]
                            }],
                            "properties": {
                                "showOutputText": false,
                                "horizontal": false
                            }
                        }, {
                            "id": 77,
                            "type": "UpscaleModelLoader",
                            "pos": [1614, 36],
                            "size": [315, 58],
                            "flags": {},
                            "order": 3,
                            "mode": 4,
                            "inputs": [],
                            "outputs": [{
                                "name": "UPSCALE_MODEL",
                                "type": "UPSCALE_MODEL",
                                "slot_index": 0,
                                "links": [137]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "UpscaleModelLoader"
                            },
                            "widgets_values": ["4x-UltraSharp.pth"]
                        }, {
                            "id": 88,
                            "type": "PreviewImage",
                            "pos": [1710.1337890625, 326.5677795410156],
                            "size": [210, 246],
                            "flags": {},
                            "order": 13,
                            "mode": 0,
                            "inputs": [{
                                "name": "images",
                                "type": "IMAGE",
                                "link": 150
                            }],
                            "outputs": [],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "PreviewImage"
                            },
                            "widgets_values": []
                        }, {
                            "id": 7,
                            "type": "VAEDecode",
                            "pos": [1386, 405],
                            "size": [210, 46],
                            "flags": {
                                "collapsed": false
                            },
                            "order": 11,
                            "mode": 0,
                            "inputs": [{
                                "name": "samples",
                                "type": "LATENT",
                                "link": 93
                            }, {
                                "name": "vae",
                                "type": "VAE",
                                "link": 143
                            }],
                            "outputs": [{
                                "name": "IMAGE",
                                "type": "IMAGE",
                                "slot_index": 0,
                                "links": [140, 150]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "VAEDecode"
                            },
                            "widgets_values": []
                        }, {
                            "id": 6,
                            "type": "EmptyLatentImage",
                            "pos": [623, 448],
                            "size": [315, 106],
                            "flags": {},
                            "order": 4,
                            "mode": 0,
                            "inputs": [],
                            "outputs": [{
                                "name": "LATENT",
                                "type": "LATENT",
                                "slot_index": 0,
                                "links": [90]
                            }],
                            "title": "IMAGE SIZE",
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "EmptyLatentImage"
                            },
                            "widgets_values": [512, 512, 1]
                        }, {
                            "id": 44,
                            "type": "CLIPTextEncode",
                            "pos": [750.7040405273438, 844.0071411132812],
                            "size": [400, 200],
                            "flags": {
                                "collapsed": false
                            },
                            "order": 6,
                            "mode": 0,
                            "inputs": [{
                                "name": "clip",
                                "type": "CLIP",
                                "link": 142
                            }],
                            "outputs": [{
                                "name": "CONDITIONING",
                                "type": "CONDITIONING",
                                "slot_index": 0,
                                "links": [132]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "CLIPTextEncode"
                            },
                            "widgets_values": ["a frightened woman wearing a tight business dress, full make up.  A group of street bums approaching her in the background."],
                            "color": "#232",
                            "bgcolor": "#353"
                        }, {
                            "id": 95,
                            "type": "PreviewImage",
                            "pos": [2312.433837890625, 189.66769409179688],
                            "size": [210, 246],
                            "flags": {},
                            "order": 15,
                            "mode": 0,
                            "inputs": [{
                                "name": "images",
                                "type": "IMAGE",
                                "link": 164
                            }],
                            "outputs": [],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "PreviewImage"
                            },
                            "widgets_values": []
                        }, {
                            "id": 78,
                            "type": "ImageUpscaleWithModel",
                            "pos": [1990, 130],
                            "size": [241.79998779296875, 46],
                            "flags": {},
                            "order": 14,
                            "mode": 4,
                            "inputs": [{
                                "name": "upscale_model",
                                "type": "UPSCALE_MODEL",
                                "link": 137
                            }, {
                                "name": "image",
                                "type": "IMAGE",
                                "link": 141
                            }],
                            "outputs": [{
                                "name": "IMAGE",
                                "type": "IMAGE",
                                "slot_index": 0,
                                "links": [164]
                            }],
                            "properties": {
                                "cnr_id": "comfy-core",
                                "ver": "0.3.27",
                                "Node name for S&R": "ImageUpscaleWithModel"
                            },
                            "widgets_values": []
                        }, {
                            "id": 24,
                            "type": "UnetLoaderGGUF",
                            "pos": [637, 1294],
                            "size": [280.6925048828125, 58],
                            "flags": {},
                            "order": 5,
                            "mode": 0,
                            "inputs": [],
                            "outputs": [{
                                "name": "MODEL",
                                "type": "MODEL",
                                "slot_index": 0,
                                "links": [144]
                            }],
                            "properties": {
                                "cnr_id": "comfyui-gguf",
                                "ver": "bc5223b0e37e053dbec2ea5e5f52c2fd4b8f712a",
                                "Node name for S&R": "UnetLoaderGGUF"
                            },
                            "widgets_values": ["FLUX1\\flux1-dev-Q8_0.gguf"]
                        }],
                        "links": [
                            [90, 6, 0, 52, 3, "LATENT"],
                            [93, 52, 0, 7, 0, "LATENT"],
                            [102, 58, 0, 52, 0, "MODEL"],
                            [132, 44, 0, 46, 0, "CONDITIONING"],
                            [137, 77, 0, 78, 0, "UPSCALE_MODEL"],
                            [140, 7, 0, 80, 0, "*"],
                            [141, 80, 0, 78, 1, "IMAGE"],
                            [142, 4, 0, 44, 0, "CLIP"],
                            [143, 8, 0, 7, 1, "VAE"],
                            [144, 24, 0, 58, 0, "MODEL"],
                            [146, 4, 0, 58, 1, "CLIP"],
                            [147, 4, 0, 29, 0, "CLIP"],
                            [148, 29, 0, 52, 2, "CONDITIONING"],
                            [149, 46, 0, 52, 1, "CONDITIONING"],
                            [150, 7, 0, 88, 0, "IMAGE"],
                            [164, 78, 0, 95, 0, "IMAGE"]
                        ],
                        "groups": [{
                            "id": 1,
                            "title": "MODEL",
                            "bounding": [610, 1180, 926, 215],
                            "color": "#a1309b",
                            "font_size": 24,
                            "flags": {}
                        }, {
                            "id": 2,
                            "title": "PROMPT",
                            "bounding": [330, 760, 1216, 387],
                            "color": "#8A8",
                            "font_size": 24,
                            "flags": {}
                        }, {
                            "id": 3,
                            "title": "IMAGE",
                            "bounding": [600, 300, 945, 434],
                            "color": "#3f789e",
                            "font_size": 24,
                            "flags": {}
                        }, {
                            "id": 4,
                            "title": "LORA",
                            "bounding": [190, 300, 388, 433],
                            "color": "#b58b2a",
                            "font_size": 24,
                            "flags": {}
                        }],
                        "config": {},
                        "extra": {
                            "ds": {
                                "scale": 1.1000000000000005,
                                "offset": [-145.6795101240437, -812.8881562486656]
                            },
                            "frontendVersion": "1.24.1",
                            "VHS_latentpreview": false,
                            "VHS_latentpreviewrate": 0,
                            "VHS_MetadataImage": true,
                            "VHS_KeepIntermediate": true
                        },
                        "version": 0.4
                    }
                },
                "client_id": "49f2ad20f93146288779681f8911411c"
            },
            ["88", "95"]
        ]
    ],
    "queue_pending": []
}

*******

http://localhost:8188/api/history?max_items=64
queue_volatile()

Nothing for running items

dict of prompt_id : {
  prompt
  outputs
	"status": {
		"status_str": "success",
		"completed": true,
		"messages": [
			[
				"execution_start",
				{
					"prompt_id": "04807330-7171-4329-99b0-4460e639d657",
					"timestamp": 1755143903534
				}
			],
			[
				"execution_cached",
				{
					"nodes": [],
					"prompt_id": "04807330-7171-4329-99b0-4460e639d657",
					"timestamp": 1755143903537
				}
			],
			[
				"execution_success",
				{
					"prompt_id": "04807330-7171-4329-99b0-4460e639d657",
					"timestamp": 1755143937517
				}
			]
		]
	}
	"meta": {
		"11": {
			"node_id": "11",
			"display_node": "11",
			"parent_node": null,
			"real_node_id": "11"
		}
  }
}

 */


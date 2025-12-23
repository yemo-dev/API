import axios from 'axios';

export default {
  name: "Ustadz Image Maker (Type 2)",
  description: "Create Ustadz V2 quote images based on image templates with automatically wrapped text.",
  category: "Maker",
  methods: ["GET"],
  params: ["text"],
  paramsSchema: {
    text: { type: "string", required: true },
  },
  async run(req, res) {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        creator: "GIMI❤️",
        error: "Parameter 'text' is required."
      });
    }

    try {
      const response = await axios.post(
        'https://lemon-ustad.vercel.app/api/generate-image',
        {
          isi: text,
          option: 'type2'
        },
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      res.setHeader('Content-Type', 'image/png');
      res.send(response.data);
    } catch (error) {
      console.error('Ustadz Maker Error (type2):', error?.message || error);
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: error?.message || 'Failed to generate Ustadz image (Type 2).'
      });
    }
  }
};


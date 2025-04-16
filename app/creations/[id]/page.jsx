import { notFound } from "next/navigation";

const CreationDetails = async ({ params }) => {
  const { id } = await params; // Directly access the id from params

  const getCreation = async (creationId) => {
    if (!creationId) return null;

    // --- REPLACE THIS WITH YOUR ACTUAL DATA FETCHING LOGIC ---
    // Example using a hypothetical data fetching function:
    // const creationData = await fetch(`/api/creations/${creationId}`);
    // if (!creationData.ok) {
    //   return null;
    // }
    // const creation = await creationData.json();
    // return creation;

    // --- Placeholder data for demonstration ---
    const creations = [
      { id: "some-unique-id", name: "Creation One" },
      { id: id, name: "Found Creation" },
      { id: "another-id", name: "Creation Two" },
    ];
    const creation = creations.find((c) => c.id === creationId);
    // --- End of placeholder ---

    if (!creation) {
      notFound();
    }
    return creation;
  };

  const creation = await getCreation(id);

  if (!creation) {
    // notFound() might have already been called in getCreation,
    // but it's good to handle the null case here as well,
    // especially if your actual data fetching might return null
    return null;
  }

  return (
    <div className="h-[4000px] mt-20">
      <h1>Page de la création : {creation.id}</h1> {/* Access creation.id */}
      {/* Ajoutez ici le contenu spécifique à la création */}
      <p>
        Nom de la création: {creation.name ? creation.name : "Nom inconnu"}
      </p>{" "}
      {/* Example of displaying other data */}
    </div>
  );
};

export default CreationDetails;

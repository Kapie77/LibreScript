// DocumentPage.tsx
// src/editor/components/DocumentEditor/

// FOLHA DE EDIÇÃO //
import "./DocumentEditor.css";
// --------------------------------- //
type Props = {
    children: React.ReactNode;
};

export default function DocumentPage({
    children,
}: Props) {
// ----------------------------------- //
    return (

        <div className="document-page">

            {children}

        </div>

    );

}